import json
from datetime import datetime
from flask import Blueprint, jsonify
from extensions import db
from models import (
    Application, Scholarship, Profile,
    EssayEvaluation, EligibilityResult,
    Document, ScholarshipMatch
)
from auth_utils import token_required

dashboard_bp = Blueprint('dashboard', __name__)


def _compute_readiness(application, profile, user_id):
    """
    Calculates a readiness score (0 to 10) and lists blockers that prevent submission.
    Covers: essay, eligibility, profile completeness, required documents, deadline urgency.
    """
    blockers = []

    # 1. Essay linked and evaluated
    if not application.essay_id:
        blockers.append('No essay linked to this application')
    else:
        latest_eval = EssayEvaluation.query.filter_by(
            essay_id=application.essay_id
        ).order_by(EssayEvaluation.created_at.desc()).first()

        if not latest_eval:
            blockers.append('Essay has not been evaluated yet')
        elif latest_eval.overall_score is not None and latest_eval.overall_score < 6.0:
            blockers.append(f'Essay score below target ({latest_eval.overall_score:.1f}/10 — aim for 6+)')

    # 2. Eligibility check run and passed
    eligibility = EligibilityResult.query.filter_by(
        user_id=user_id,
        scholarship_id=application.scholarship_id
    ).order_by(EligibilityResult.created_at.desc()).first()

    if not eligibility:
        blockers.append('Eligibility has not been checked for this scholarship')
    elif not eligibility.eligible:
        blockers.append('Eligibility check failed — review failed criteria')

    # 3. Profile completeness
    if not profile:
        blockers.append('Profile is incomplete')
    else:
        p = profile.to_dict()
        required_fields = ['full_name', 'phone', 'ic_number', 'citizenship', 'cgpa', 'course']
        missing = [f for f in required_fields if not p.get(f)]
        if missing:
            blockers.append(f'Profile missing fields: {", ".join(missing)}')

    # 4. Required documents uploaded
    scholarship = Scholarship.query.get(application.scholarship_id)
    if scholarship and scholarship.required_documents:
        required_docs = json.loads(scholarship.required_documents)
        uploaded_types = {
            d.document_type
            for d in Document.query.filter_by(user_id=user_id).all()
        }
        missing_docs = [d for d in required_docs if d not in uploaded_types]
        if missing_docs:
            blockers.append(f'Missing documents: {", ".join(missing_docs)}')

    # 5. Deadline urgency
    if application.deadline:
        days_left = (application.deadline - datetime.utcnow()).days
        if days_left < 0:
            blockers.append('Deadline has already passed')
        elif days_left <= 3:
            blockers.append(f'Deadline in {days_left} day(s) — submit urgently!')
        elif days_left <= 7:
            blockers.append(f'Deadline in {days_left} days — finalise soon')

    # Score: start at 10, deduct 2 per blocker, floor at 0
    readiness_score = max(0.0, round(10.0 - len(blockers) * 2.0, 1))
    return readiness_score, blockers


@dashboard_bp.route('', methods=['GET'])
@token_required
def get_dashboard(current_user):
    """
    Full application dashboard — one entry per application with:
    scholarship name, deadline, days left, status, fit score,
    eligibility result, readiness score, blockers, essay score.
    """
    applications = Application.query.filter_by(user_id=current_user.id).all()
    profile = Profile.query.filter_by(user_id=current_user.id).first()

    dashboard = []
    for app in applications:
        scholarship = Scholarship.query.get(app.scholarship_id)

        # Latest eligibility check
        eligibility = EligibilityResult.query.filter_by(
            user_id=current_user.id,
            scholarship_id=app.scholarship_id
        ).order_by(EligibilityResult.created_at.desc()).first()

        # Latest essay evaluation
        latest_eval = None
        if app.essay_id:
            latest_eval = EssayEvaluation.query.filter_by(
                essay_id=app.essay_id
            ).order_by(EssayEvaluation.created_at.desc()).first()

        # Latest fit score from matches
        latest_match = ScholarshipMatch.query.filter_by(
            user_id=current_user.id,
            scholarship_id=app.scholarship_id
        ).order_by(ScholarshipMatch.created_at.desc()).first()

        readiness_score, blockers = _compute_readiness(app, profile, current_user.id)

        # Persist readiness and essay score to application record
        app.readiness_score = readiness_score
        if latest_eval:
            app.latest_score = latest_eval.overall_score

        days_left = (app.deadline - datetime.utcnow()).days if app.deadline else None

        dashboard.append({
            'application_id': app.id,
            'scholarship_id': app.scholarship_id,
            'scholarship': scholarship.title if scholarship else None,
            'provider': scholarship.provider if scholarship else None,
            'portal_url': scholarship.portal_url if scholarship else None,
            'deadline': app.deadline.isoformat() if app.deadline else None,
            'days_left': days_left,
            'status': app.status,
            'fit_score': latest_match.fit_score if latest_match else None,
            'match_reason': latest_match.match_reason if latest_match else None,
            'eligible': eligibility.eligible if eligibility else None,
            'essay_score': latest_eval.overall_score if latest_eval else None,
            'readiness_score': readiness_score,
            'blockers': blockers
        })

    db.session.commit()
    return jsonify({'dashboard': dashboard})


@dashboard_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user):
    """
    High-level stats: total applications, counts by status, profile completeness.
    """
    applications = Application.query.filter_by(user_id=current_user.id).all()

    by_status = {}
    for app in applications:
        by_status[app.status] = by_status.get(app.status, 0) + 1

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    profile_complete = False
    if profile:
        p = profile.to_dict()
        required = ['full_name', 'phone', 'ic_number', 'citizenship', 'cgpa', 'course']
        profile_complete = all(p.get(f) for f in required)

    total_docs = Document.query.filter_by(user_id=current_user.id).count()
    total_matches = ScholarshipMatch.query.filter_by(user_id=current_user.id).count()

    return jsonify({
        'total_applications': len(applications),
        'by_status': by_status,
        'profile_complete': profile_complete,
        'total_documents_uploaded': total_docs,
        'scholarship_matches_run': total_matches
    })


@dashboard_bp.route('/deadlines', methods=['GET'])
@token_required
def get_deadlines(current_user):
    """
    All applications with deadlines, sorted by soonest first.
    Flags urgent (≤7 days) and overdue entries.
    """
    applications = Application.query.filter_by(
        user_id=current_user.id
    ).filter(Application.deadline.isnot(None)).order_by(Application.deadline.asc()).all()

    now = datetime.utcnow()
    deadlines = []
    for app in applications:
        scholarship = Scholarship.query.get(app.scholarship_id)
        days_left = (app.deadline - now).days
        deadlines.append({
            'application_id': app.id,
            'scholarship': scholarship.title if scholarship else None,
            'provider': scholarship.provider if scholarship else None,
            'deadline': app.deadline.isoformat(),
            'days_left': days_left,
            'status': app.status,
            'overdue': days_left < 0,
            'urgent': 0 <= days_left <= 7
        })

    return jsonify({'deadlines': deadlines})


@dashboard_bp.route('/readiness/<int:application_id>', methods=['GET'])
@token_required
def get_readiness(current_user, application_id):
    """
    Detailed readiness report for a single application.
    Lists every blocker preventing submission.
    """
    application = Application.query.filter_by(
        id=application_id, user_id=current_user.id
    ).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    readiness_score, blockers = _compute_readiness(application, profile, current_user.id)

    days_left = (application.deadline - datetime.utcnow()).days if application.deadline else None
    scholarship = Scholarship.query.get(application.scholarship_id)

    return jsonify({
        'application_id': application_id,
        'scholarship': scholarship.title if scholarship else None,
        'status': application.status,
        'readiness_score': readiness_score,
        'blockers': blockers,
        'days_left': days_left,
        'ready_to_submit': len(blockers) == 0
    })
