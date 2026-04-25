import json
from flask import Blueprint, request, jsonify
from extensions import db
from models import Profile
from auth_utils import token_required

profile_bp = Blueprint('profile', __name__)


@profile_bp.route('', methods=['GET'])
@token_required
def get_profile(current_user):
    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    return jsonify({'profile': profile.to_dict()})


@profile_bp.route('', methods=['POST'])
@token_required
def create_profile(current_user):
    if Profile.query.filter_by(user_id=current_user.id).first():
        return jsonify({'error': 'Profile already exists. Use PUT to update.'}), 409

    data = request.get_json()
    profile = Profile(
        user_id=current_user.id,
        full_name=data.get('full_name'),
        phone=data.get('phone'),
        ic_number=data.get('ic_number'),
        citizenship=data.get('citizenship'),
        race=data.get('race'),
        cgpa=data.get('cgpa'),
        school=data.get('school'),
        course=data.get('course'),
        achievements=json.dumps(data.get('achievements', [])),
        extracurriculars=json.dumps(data.get('extracurriculars', [])),
        financial_info=data.get('financial_info'),
        goals=data.get('goals'),
        bio=data.get('bio')
    )
    db.session.add(profile)
    db.session.commit()
    return jsonify({'message': 'Profile created', 'profile': profile.to_dict()}), 201


@profile_bp.route('', methods=['PUT'])
@token_required
def update_profile(current_user):
    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found. Use POST to create.'}), 404

    data = request.get_json()
    updatable = ['full_name', 'phone', 'ic_number', 'citizenship', 'race',
                 'cgpa', 'school', 'course', 'financial_info', 'goals', 'bio']

    for field in updatable:
        if field in data:
            setattr(profile, field, data[field])

    if 'achievements' in data:
        profile.achievements = json.dumps(data['achievements'])
    if 'extracurriculars' in data:
        profile.extracurriculars = json.dumps(data['extracurriculars'])

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'profile': profile.to_dict()})
