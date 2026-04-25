from flask import Blueprint, request, jsonify
from extensions import db
from models import Essay
from auth_utils import token_required

essays_bp = Blueprint('essays', __name__)


@essays_bp.route('', methods=['POST'])
@token_required
def create_essay(current_user):
    """Create a new essay for the current user."""
    data = request.get_json()
    if not data or not data.get('essay_text'):
        return jsonify({'error': 'essay_text is required'}), 400

    essay = Essay(
        user_id=current_user.id,
        title=data.get('title'),
        essay_text=data['essay_text'],
        version=1
    )
    db.session.add(essay)
    db.session.commit()
    return jsonify({'message': 'Essay created', 'essay': essay.to_dict()}), 201


@essays_bp.route('', methods=['GET'])
@token_required
def get_essays(current_user):
    """List all essays belonging to the current user."""
    essays = Essay.query.filter_by(user_id=current_user.id).order_by(Essay.created_at.desc()).all()
    return jsonify({'essays': [e.to_dict() for e in essays]})


@essays_bp.route('/<int:essay_id>', methods=['GET'])
@token_required
def get_essay(current_user, essay_id):
    """Get a single essay by ID (must belong to current user)."""
    essay = Essay.query.filter_by(id=essay_id, user_id=current_user.id).first()
    if not essay:
        return jsonify({'error': 'Essay not found'}), 404
    return jsonify({'essay': essay.to_dict()})


@essays_bp.route('/<int:essay_id>', methods=['PUT'])
@token_required
def update_essay(current_user, essay_id):
    """Update an essay. Bumps version number if essay_text changes."""
    essay = Essay.query.filter_by(id=essay_id, user_id=current_user.id).first()
    if not essay:
        return jsonify({'error': 'Essay not found'}), 404

    data = request.get_json()
    if 'title' in data:
        essay.title = data['title']
    if 'essay_text' in data:
        essay.essay_text = data['essay_text']
        essay.version += 1     # bump version on every text change

    db.session.commit()
    return jsonify({'message': 'Essay updated', 'essay': essay.to_dict()})
