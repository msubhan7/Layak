from flask import Blueprint, request, jsonify
from extensions import db
from models import Scholarship, University

scholarships_bp = Blueprint('scholarships', __name__)
universities_bp = Blueprint('universities', __name__)


# ─────────────────────────────────────────────
# Scholarship Routes
# ─────────────────────────────────────────────

@scholarships_bp.route('', methods=['GET'])
def get_scholarships():
    """List all scholarships. Supports optional query filters."""
    field = request.args.get('field')
    open_to = request.args.get('open_to')
    min_cgpa = request.args.get('min_cgpa', type=float)

    query = Scholarship.query
    if field:
        query = query.filter(Scholarship.field_of_study.ilike(f'%{field}%'))
    if open_to:
        query = query.filter(Scholarship.open_to.ilike(f'%{open_to}%'))
    if min_cgpa is not None:
        query = query.filter(Scholarship.min_cgpa <= min_cgpa)

    scholarships = query.all()
    return jsonify({'scholarships': [s.to_dict() for s in scholarships]})


@scholarships_bp.route('/<int:scholarship_id>', methods=['GET'])
def get_scholarship(scholarship_id):
    """Get a single scholarship by ID."""
    scholarship = Scholarship.query.get_or_404(scholarship_id)
    return jsonify({'scholarship': scholarship.to_dict()})


# ─────────────────────────────────────────────
# University Routes
# ─────────────────────────────────────────────

@universities_bp.route('', methods=['GET'])
def get_universities():
    """List all universities."""
    universities = University.query.all()
    return jsonify({'universities': [u.to_dict() for u in universities]})


@universities_bp.route('/<int:university_id>', methods=['GET'])
def get_university(university_id):
    """Get a single university with its associated scholarships."""
    university = University.query.get_or_404(university_id)
    scholarships = Scholarship.query.filter_by(university_id=university_id).all()
    result = university.to_dict()
    result['scholarships'] = [s.to_dict() for s in scholarships]
    return jsonify({'university': result})
