import os
import json
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from models import Document, Scholarship
from auth_utils import token_required

documents_bp = Blueprint('documents', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@documents_bp.route('/upload', methods=['POST'])
@token_required
def upload_document(current_user):
    """Upload a document file and tag it with a document type."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': f'File type not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    document_type = request.form.get('document_type', 'other')
    is_certified = request.form.get('is_certified', 'false').lower() == 'true'

    filename = secure_filename(file.filename)
    # Namespace by user to prevent collisions
    user_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], str(current_user.id))
    os.makedirs(user_folder, exist_ok=True)
    file_path = os.path.join(user_folder, filename)
    file.save(file_path)

    document = Document(
        user_id=current_user.id,
        document_type=document_type,
        filename=filename,
        file_url=file_path,
        is_certified=is_certified
    )
    db.session.add(document)
    db.session.commit()
    return jsonify({'message': 'Document uploaded', 'document': document.to_dict()}), 201


@documents_bp.route('', methods=['GET'])
@token_required
def get_documents(current_user):
    """List all documents uploaded by the current user."""
    documents = Document.query.filter_by(user_id=current_user.id).order_by(
        Document.uploaded_at.desc()
    ).all()
    return jsonify({'documents': [d.to_dict() for d in documents]})


@documents_bp.route('/checklist/<int:scholarship_id>', methods=['GET'])
@token_required
def document_checklist(current_user, scholarship_id):
    """
    Compare user-uploaded documents against a scholarship's required documents.
    Returns a per-document checklist, list of missing docs, and overall completeness.
    """
    scholarship = Scholarship.query.get_or_404(scholarship_id)
    required_docs = json.loads(scholarship.required_documents) if scholarship.required_documents else []

    user_docs = Document.query.filter_by(user_id=current_user.id).all()

    # Build a map: doc_type -> list of uploaded documents of that type
    uploaded_map = {}
    for doc in user_docs:
        uploaded_map.setdefault(doc.document_type, []).append(doc)

    checklist = []
    for doc_type in required_docs:
        docs_of_type = uploaded_map.get(doc_type, [])
        uploaded = len(docs_of_type) > 0
        certified = any(d.is_certified for d in docs_of_type)
        checklist.append({
            'document_type': doc_type,
            'uploaded': uploaded,
            'certified': certified,
            'files': [d.to_dict() for d in docs_of_type]
        })

    missing = [item['document_type'] for item in checklist if not item['uploaded']]
    uncertified = [item['document_type'] for item in checklist if item['uploaded'] and not item['certified']]

    return jsonify({
        'scholarship_id': scholarship_id,
        'scholarship': scholarship.title,
        'checklist': checklist,
        'missing': missing,
        'uncertified': uncertified,
        'complete': len(missing) == 0
    })
