from flask import Blueprint, request, jsonify
from extensions import db
from models import Application, Scholarship, Essay
from auth_utils import token_required
from notification_helpers import notify_status_update


applications_bp = Blueprint('applications', __name__)

VALID_STATUSES = [
    'draft', 'reviewed', 'needs_improvement',
    'ready_to_submit', 'submitted', 'shortlisted',
    'rejected', 'accepted'
]


@applications_bp.route('', methods=['POST'])
@token_required
def create_application(current_user):
    """
    Create a new application record linking a user, scholarship, and optionally an essay.
    Deadline is auto-populated from the scholarship if not provided.

    Body: { scholarship_id, essay_id (optional) }
    """
    data = request.get_json()
    scholarship_id = data.get('scholarship_id')
    if not scholarship_id:
        return jsonify({'error': 'scholarship_id is required'}), 400

    scholarship = Scholarship.query.get(scholarship_id)
    if not scholarship:
        return jsonify({'error': 'Scholarship not found'}), 404

    # Prevent duplicate applications for the same scholarship
    existing = Application.query.filter_by(
        user_id=current_user.id,
        scholarship_id=scholarship_id
    ).first()
    if existing:
        return jsonify({'error': 'Application for this scholarship already exists', 'application': existing.to_dict()}), 409

    application = Application(
        user_id=current_user.id,
        scholarship_id=scholarship_id,
        essay_id=data.get('essay_id'),
        status='draft',
        deadline=scholarship.deadline
    )
    db.session.add(application)
    db.session.commit()
    return jsonify({'message': 'Application created', 'application': application.to_dict()}), 201


@applications_bp.route('', methods=['GET'])
@token_required
def get_applications(current_user):
    """List all applications for the current user."""
    applications = Application.query.filter_by(user_id=current_user.id).order_by(
        Application.created_at.desc()
    ).all()
    return jsonify({'applications': [a.to_dict() for a in applications]})


@applications_bp.route('/<int:application_id>', methods=['GET'])
@token_required
def get_application(current_user, application_id):
    """Get a single application with full scholarship and essay info."""
    application = Application.query.filter_by(
        id=application_id, user_id=current_user.id
    ).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    result = application.to_dict()
    if application.scholarship:
        result['scholarship_details'] = application.scholarship.to_dict()
    if application.essay:
        result['essay_details'] = application.essay.to_dict()
    return jsonify({'application': result})


@applications_bp.route('/<int:application_id>/status', methods=['PUT'])
@token_required
def update_status(current_user, application_id):
    """
    Update the status of an application.

    Body: { status: "<one of VALID_STATUSES>" }
    """
    application = Application.query.filter_by(
        id=application_id, user_id=current_user.id
    ).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    data = request.get_json()
    new_status = data.get('status')
    if new_status not in VALID_STATUSES:
        return jsonify({'error': f'Invalid status. Must be one of: {VALID_STATUSES}'}), 400

    application.status = new_status
    db.session.commit()

    # Notify user their application status has changed
    scholarship_title = application.scholarship.title if application.scholarship else f"Application #{application_id}"
    notify_status_update(current_user.id, application_id, scholarship_title, new_status)

    return jsonify({'message': 'Status updated', 'application': application.to_dict()})


@applications_bp.route('/<int:application_id>', methods=['DELETE'])
@token_required
def delete_application(current_user, application_id):
    """Delete an application record."""
    application = Application.query.filter_by(
        id=application_id, user_id=current_user.id
    ).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    db.session.delete(application)
    db.session.commit()
    return jsonify({'message': 'Application deleted'})

@applications_bp.route('/<int:application_id>/essay', methods=['PUT'])
@token_required
def link_essay(current_user, application_id):
    """
    Link (or replace) an essay on an existing application.
    Allows users who created an application without an essay to attach one later.

    Body: { essay_id: <int> }
    """
    application = Application.query.filter_by(
        id=application_id, user_id=current_user.id
    ).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    data = request.get_json()
    essay_id = data.get('essay_id')
    if not essay_id:
        return jsonify({'error': 'essay_id is required'}), 400

    essay = Essay.query.filter_by(id=essay_id, user_id=current_user.id).first()
    if not essay:
        return jsonify({'error': 'Essay not found'}), 404

    application.essay_id = essay_id
    db.session.commit()
    return jsonify({'message': 'Essay linked to application', 'application': application.to_dict()})
