import json
from flask import Blueprint, request, jsonify
from extensions import db
from models import (
    Profile, Scholarship, Essay,
    EssayEvaluation, EligibilityResult,
    ScholarshipMatch, ReshapedContent
)
from auth_utils import token_required
from ai_service import (
    evaluate_essay, check_eligibility,
    match_scholarships, reshape_content, autofill_form
)

ai_bp = Blueprint('ai', __name__)


def _ai_failed(result: dict) -> bool:
    """Returns True if ai_service returned a structured error instead of real data."""
    return isinstance(result, dict) and 'error' in result and 'details' in result


# ─────────────────────────────────────────────
# AI Feature 1: Essay Scorer & Improver
# ─────────────────────────────────────────────

@ai_bp.route('/evaluate-essay', methods=['POST'])
@token_required
def evaluate_essay_route(current_user):
    """
    Evaluate an essay against a scholarship's criteria.
    Saves and returns the full EssayEvaluation record.

    Body: { essay_id, scholarship_id (optional), essay_prompt (optional), evaluation_criteria (optional) }
    """
    data = request.get_json()
    essay_id = data.get('essay_id')
    scholarship_id = data.get('scholarship_id')

    if not essay_id:
        return jsonify({'error': 'essay_id is required'}), 400

    essay = Essay.query.filter_by(id=essay_id, user_id=current_user.id).first()
    if not essay:
        return jsonify({'error': 'Essay not found'}), 404

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found. Complete your profile first.'}), 404

    scholarship = Scholarship.query.get(scholarship_id) if scholarship_id else None
    essay_prompt = (scholarship.essay_prompt if scholarship else None) or data.get('essay_prompt', '')
    evaluation_criteria = (scholarship.evaluation_criteria if scholarship else None) or data.get('evaluation_criteria', '')

    result = evaluate_essay(essay.essay_text, essay_prompt, evaluation_criteria, profile.to_dict())

    if _ai_failed(result):
        return jsonify({
            'error': 'AI evaluation failed. Please try again.',
            'details': result.get('details'),
            'feature': result.get('feature')
        }), 502

    evaluation = EssayEvaluation(
        essay_id=essay.id,
        scholarship_id=scholarship_id,
        overall_score=result.get('overall_score'),
        criterion_scores_json=json.dumps(result.get('criterion_scores', {})),
        matched_requirements=json.dumps(result.get('matched_requirements', [])),
        missing_requirements=json.dumps(result.get('missing_requirements', [])),
        weaknesses=json.dumps(result.get('weaknesses', [])),
        revision_suggestions=json.dumps(result.get('revision_suggestions', [])),
        paragraph_feedback_json=json.dumps(result.get('paragraph_feedback', [])),
        tone_check=json.dumps(result.get('tone_check', {})),
        contradiction_check=json.dumps(result.get('contradiction_check', {}))
    )
    db.session.add(evaluation)
    db.session.commit()

    return jsonify({'message': 'Essay evaluated', 'evaluation': evaluation.to_dict()}), 201


@ai_bp.route('/re-evaluate-essay', methods=['POST'])
@token_required
def re_evaluate_essay_route(current_user):
    """
    Re-run evaluation on an (updated) essay. Creates a new EssayEvaluation record
    so the full history is preserved.

    Body: { essay_id, scholarship_id (optional), essay_prompt (optional), evaluation_criteria (optional) }
    """
    data = request.get_json()
    essay_id = data.get('essay_id')
    scholarship_id = data.get('scholarship_id')

    if not essay_id:
        return jsonify({'error': 'essay_id is required'}), 400

    essay = Essay.query.filter_by(id=essay_id, user_id=current_user.id).first()
    if not essay:
        return jsonify({'error': 'Essay not found'}), 404

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found. Complete your profile first.'}), 404

    scholarship = Scholarship.query.get(scholarship_id) if scholarship_id else None
    essay_prompt = (scholarship.essay_prompt if scholarship else None) or data.get('essay_prompt', '')
    evaluation_criteria = (scholarship.evaluation_criteria if scholarship else None) or data.get('evaluation_criteria', '')

    result = evaluate_essay(essay.essay_text, essay_prompt, evaluation_criteria, profile.to_dict())

    if _ai_failed(result):
        return jsonify({
            'error': 'AI re-evaluation failed. Please try again.',
            'details': result.get('details'),
            'feature': result.get('feature')
        }), 502

    evaluation = EssayEvaluation(
        essay_id=essay.id,
        scholarship_id=scholarship_id,
        overall_score=result.get('overall_score'),
        criterion_scores_json=json.dumps(result.get('criterion_scores', {})),
        matched_requirements=json.dumps(result.get('matched_requirements', [])),
        missing_requirements=json.dumps(result.get('missing_requirements', [])),
        weaknesses=json.dumps(result.get('weaknesses', [])),
        revision_suggestions=json.dumps(result.get('revision_suggestions', [])),
        paragraph_feedback_json=json.dumps(result.get('paragraph_feedback', [])),
        tone_check=json.dumps(result.get('tone_check', {})),
        contradiction_check=json.dumps(result.get('contradiction_check', {}))
    )
    db.session.add(evaluation)
    db.session.commit()

    return jsonify({'message': 'Essay re-evaluated', 'evaluation': evaluation.to_dict()}), 201


# ─────────────────────────────────────────────
# AI Feature 2: Eligibility Checker
# ─────────────────────────────────────────────

@ai_bp.route('/check-eligibility', methods=['POST'])
@token_required
def check_eligibility_route(current_user):
    """
    Check whether the current user qualifies for a scholarship.
    Stores and returns the EligibilityResult.

    Body: { scholarship_id }
    """
    data = request.get_json()
    scholarship_id = data.get('scholarship_id')
    if not scholarship_id:
        return jsonify({'error': 'scholarship_id is required'}), 400

    scholarship = Scholarship.query.get(scholarship_id)
    if not scholarship:
        return jsonify({'error': 'Scholarship not found'}), 404

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found. Complete your profile first.'}), 404

    result = check_eligibility(scholarship.to_dict(), profile.to_dict())

    if _ai_failed(result):
        return jsonify({
            'error': 'AI eligibility check failed. Please try again.',
            'details': result.get('details'),
            'feature': result.get('feature')
        }), 502

    eligibility_result = EligibilityResult(
        user_id=current_user.id,
        scholarship_id=scholarship_id,
        eligible=result.get('eligible'),
        passed_criteria=json.dumps(result.get('passed_criteria', [])),
        failed_criteria=json.dumps(result.get('failed_criteria', [])),
        warnings=json.dumps(result.get('warnings', []))
    )
    db.session.add(eligibility_result)
    db.session.commit()

    return jsonify({
        'message': 'Eligibility checked',
        'result': eligibility_result.to_dict(),
        'hard_disqualifiers': result.get('hard_disqualifiers', []),
        'summary': result.get('summary')
    }), 201


# ─────────────────────────────────────────────
# AI Feature 3: Smart Scholarship Matching
# ─────────────────────────────────────────────

@ai_bp.route('/match-scholarships', methods=['POST'])
@token_required
def match_scholarships_route(current_user):
    """
    Rank all available scholarships by fit for the current user.
    Saves top matches to scholarship_matches table.
    """
    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found. Complete your profile first.'}), 404

    scholarships = Scholarship.query.all()
    if not scholarships:
        return jsonify({'error': 'No scholarships available to match against'}), 404

    result = match_scholarships(profile.to_dict(), [s.to_dict() for s in scholarships])

    if _ai_failed(result):
        return jsonify({
            'error': 'AI scholarship matching failed. Please try again.',
            'details': result.get('details'),
            'feature': result.get('feature')
        }), 502

    saved = []
    for match in result.get('top_matches', []):
        sm = ScholarshipMatch(
            user_id=current_user.id,
            scholarship_id=match.get('scholarship_id'),
            fit_score=match.get('fit_score'),
            match_reason=match.get('match_reason'),
            risk_note=match.get('risk_note')
        )
        db.session.add(sm)
        saved.append(sm)

    db.session.commit()

    return jsonify({
        'message': 'Scholarships matched',
        'top_matches': result.get('top_matches', [])
    })


# ─────────────────────────────────────────────
# AI Feature 4: Content Reshaper
# ─────────────────────────────────────────────

@ai_bp.route('/reshape-content', methods=['POST'])
@token_required
def reshape_content_route(current_user):
    """
    Reshape an existing essay to fit a new scholarship question and word limit.

    Body: { essay_id, target_question, word_limit, scholarship_id (optional) }
    """
    data = request.get_json()
    essay_id = data.get('essay_id')
    target_question = data.get('target_question', '')
    word_limit = data.get('word_limit', 500)
    scholarship_id = data.get('scholarship_id')

    if not essay_id:
        return jsonify({'error': 'essay_id is required'}), 400
    if not target_question:
        return jsonify({'error': 'target_question is required'}), 400

    essay = Essay.query.filter_by(id=essay_id, user_id=current_user.id).first()
    if not essay:
        return jsonify({'error': 'Essay not found'}), 404

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found. Complete your profile first.'}), 404

    result = reshape_content(essay.essay_text, target_question, word_limit, profile.to_dict())

    if _ai_failed(result):
        return jsonify({
            'error': 'AI content reshaping failed. Please try again.',
            'details': result.get('details'),
            'feature': result.get('feature')
        }), 502

    reshaped = ReshapedContent(
        user_id=current_user.id,
        source_essay_id=essay_id,
        scholarship_id=scholarship_id,
        target_question=target_question,
        word_limit=word_limit,
        reshaped_text=result.get('reshaped_text')
    )
    db.session.add(reshaped)
    db.session.commit()

    return jsonify({
        'message': 'Content reshaped',
        'result': reshaped.to_dict(),
        'word_count': result.get('word_count'),
        'changes_made': result.get('changes_made', [])
    }), 201


# ─────────────────────────────────────────────
# AI Feature 5: Profile Autofill
# ─────────────────────────────────────────────

@ai_bp.route('/autofill', methods=['POST'])
@token_required
def autofill_route(current_user):
    """
    Suggest values for a scholarship form's fields using the user's profile.

    Body: { form_fields: ["field_name_1", "field_name_2", ...] }
    """
    data = request.get_json()
    form_fields = data.get('form_fields', [])

    if not form_fields:
        return jsonify({'error': 'form_fields list is required'}), 400

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found. Complete your profile first.'}), 404

    result = autofill_form(profile.to_dict(), form_fields)

    if _ai_failed(result):
        return jsonify({
            'error': 'AI autofill failed. Please try again.',
            'details': result.get('details'),
            'feature': result.get('feature')
        }), 502

    return jsonify({'result': result})


@ai_bp.route('/autofill-form', methods=['POST'])
@token_required
def autofill_form_route(current_user):
    """
    Spec alias for POST /ai/autofill.
    Both /ai/autofill and /ai/autofill-form remain active and share identical logic.

    Body: { form_fields: ["field_name_1", "field_name_2", ...] }
    """
    data = request.get_json()
    form_fields = data.get('form_fields', [])

    if not form_fields:
        return jsonify({'error': 'form_fields list is required'}), 400

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found. Complete your profile first.'}), 404

    result = autofill_form(profile.to_dict(), form_fields)

    if _ai_failed(result):
        return jsonify({
            'error': 'AI autofill failed. Please try again.',
            'details': result.get('details'),
            'feature': result.get('feature')
        }), 502

    return jsonify({'result': result})


# ─────────────────────────────────────────────
# GET: Stored Evaluations / Eligibility / Matches
# ─────────────────────────────────────────────

@ai_bp.route('/evaluations/<int:essay_id>', methods=['GET'])
@token_required
def get_evaluations(current_user, essay_id):
    """Return all evaluation records for a given essay (most recent first)."""
    essay = Essay.query.filter_by(id=essay_id, user_id=current_user.id).first()
    if not essay:
        return jsonify({'error': 'Essay not found'}), 404

    evaluations = EssayEvaluation.query.filter_by(essay_id=essay_id).order_by(
        EssayEvaluation.created_at.desc()
    ).all()
    return jsonify({'essay_id': essay_id, 'evaluations': [e.to_dict() for e in evaluations]})


@ai_bp.route('/eligibility/<int:scholarship_id>', methods=['GET'])
@token_required
def get_eligibility(current_user, scholarship_id):
    """Return the most recent eligibility check for this user + scholarship."""
    result = EligibilityResult.query.filter_by(
        user_id=current_user.id,
        scholarship_id=scholarship_id
    ).order_by(EligibilityResult.created_at.desc()).first()

    if not result:
        return jsonify({'error': 'No eligibility check found for this scholarship'}), 404

    return jsonify({'result': result.to_dict()})


@ai_bp.route('/matches', methods=['GET'])
@token_required
def get_matches(current_user):
    """Return all stored scholarship matches for the current user, sorted by fit_score."""
    matches = ScholarshipMatch.query.filter_by(user_id=current_user.id).order_by(
        ScholarshipMatch.fit_score.desc()
    ).all()
    return jsonify({'matches': [m.to_dict() for m in matches]})


# ─────────────────────────────────────────────
# Top-level route aliases
# Spec requires: GET /evaluations/{essay_id}, GET /eligibility/{scholarship_id}, GET /matches
# The originals at /ai/evaluations, /ai/eligibility, /ai/matches remain untouched.
# ─────────────────────────────────────────────

evaluations_bp = Blueprint('evaluations', __name__)
eligibility_bp = Blueprint('eligibility', __name__)
matches_bp = Blueprint('matches', __name__)


@evaluations_bp.route('/<int:essay_id>', methods=['GET'])
@token_required
def get_evaluations_alias(current_user, essay_id):
    """
    Spec alias for GET /ai/evaluations/<essay_id>.
    Registered at GET /evaluations/<essay_id>. Original /ai/evaluations/<essay_id> still active.
    Returns all evaluation records for a given essay (most recent first).
    """
    essay = Essay.query.filter_by(id=essay_id, user_id=current_user.id).first()
    if not essay:
        return jsonify({'error': 'Essay not found'}), 404

    evaluations = EssayEvaluation.query.filter_by(essay_id=essay_id).order_by(
        EssayEvaluation.created_at.desc()
    ).all()
    return jsonify({'essay_id': essay_id, 'evaluations': [e.to_dict() for e in evaluations]})


@eligibility_bp.route('/<int:scholarship_id>', methods=['GET'])
@token_required
def get_eligibility_alias(current_user, scholarship_id):
    """
    Spec alias for GET /ai/eligibility/<scholarship_id>.
    Registered at GET /eligibility/<scholarship_id>. Original still active.
    Returns the most recent eligibility check for this user + scholarship.
    """
    result = EligibilityResult.query.filter_by(
        user_id=current_user.id,
        scholarship_id=scholarship_id
    ).order_by(EligibilityResult.created_at.desc()).first()

    if not result:
        return jsonify({'error': 'No eligibility check found for this scholarship'}), 404

    return jsonify({'result': result.to_dict()})


@matches_bp.route('', methods=['GET'])
@token_required
def get_matches_alias(current_user):
    """
    Spec alias for GET /ai/matches.
    Registered at GET /matches. Original /ai/matches still active.
    Returns all stored scholarship matches for the current user, sorted by fit_score.
    """
    matches = ScholarshipMatch.query.filter_by(user_id=current_user.id).order_by(
        ScholarshipMatch.fit_score.desc()
    ).all()
    return jsonify({'matches': [m.to_dict() for m in matches]})
