from extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    profile = db.relationship('Profile', backref='user', uselist=False)
    documents = db.relationship('Document', backref='user')
    essays = db.relationship('Essay', backref='user')
    applications = db.relationship('Application', backref='user')
    notifications = db.relationship('Notification', backref='user')

    def to_dict(self):
        return {'id': self.id, 'email': self.email, 'created_at': self.created_at.isoformat()}


class Profile(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    full_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    ic_number = db.Column(db.String(20))
    citizenship = db.Column(db.String(50))
    race = db.Column(db.String(50))
    cgpa = db.Column(db.Float)
    school = db.Column(db.String(150))
    course = db.Column(db.String(150))
    achievements = db.Column(db.Text)       # JSON string
    extracurriculars = db.Column(db.Text)   # JSON string
    financial_info = db.Column(db.Text)
    goals = db.Column(db.Text)
    bio = db.Column(db.Text)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone': self.phone,
            'ic_number': self.ic_number,
            'citizenship': self.citizenship,
            'race': self.race,
            'cgpa': self.cgpa,
            'school': self.school,
            'course': self.course,
            'achievements': json.loads(self.achievements) if self.achievements else [],
            'extracurriculars': json.loads(self.extracurriculars) if self.extracurriculars else [],
            'financial_info': self.financial_info,
            'goals': self.goals,
            'bio': self.bio,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class University(db.Model):
    __tablename__ = 'universities'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(100))
    scholarships = db.relationship('Scholarship', backref='university')

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'location': self.location}


class Scholarship(db.Model):
    __tablename__ = 'scholarships'
    id = db.Column(db.Integer, primary_key=True)
    university_id = db.Column(db.Integer, db.ForeignKey('universities.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    provider = db.Column(db.String(100))
    deadline = db.Column(db.DateTime)
    essay_prompt = db.Column(db.Text)
    word_limit = db.Column(db.Integer)
    eligibility = db.Column(db.Text)           # full criteria text
    requirements = db.Column(db.Text)
    required_documents = db.Column(db.Text)    # JSON string list
    evaluation_criteria = db.Column(db.Text)
    amount = db.Column(db.String(100))
    open_to = db.Column(db.String(100))        # "All" / "Bumiputera" etc
    field_of_study = db.Column(db.String(100))
    min_cgpa = db.Column(db.Float)
    portal_url = db.Column(db.String(300))

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'university_id': self.university_id,
            'title': self.title,
            'provider': self.provider,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'essay_prompt': self.essay_prompt,
            'word_limit': self.word_limit,
            'eligibility': self.eligibility,
            'requirements': self.requirements,
            'required_documents': json.loads(self.required_documents) if self.required_documents else [],
            'evaluation_criteria': self.evaluation_criteria,
            'amount': self.amount,
            'open_to': self.open_to,
            'field_of_study': self.field_of_study,
            'min_cgpa': self.min_cgpa,
            'portal_url': self.portal_url
        }


class Essay(db.Model):
    __tablename__ = 'essays'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200))
    essay_text = db.Column(db.Text, nullable=False)
    version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    evaluations = db.relationship('EssayEvaluation', backref='essay')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'essay_text': self.essay_text,
            'version': self.version,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class EssayEvaluation(db.Model):
    __tablename__ = 'essay_evaluations'
    id = db.Column(db.Integer, primary_key=True)
    essay_id = db.Column(db.Integer, db.ForeignKey('essays.id'), nullable=False)
    scholarship_id = db.Column(db.Integer, db.ForeignKey('scholarships.id'), nullable=True)
    overall_score = db.Column(db.Float)
    criterion_scores_json = db.Column(db.Text)      # JSON: {clarity: 7, specificity: 5, ...}
    matched_requirements = db.Column(db.Text)       # JSON list
    missing_requirements = db.Column(db.Text)       # JSON list
    weaknesses = db.Column(db.Text)                 # JSON list
    revision_suggestions = db.Column(db.Text)       # JSON list
    paragraph_feedback_json = db.Column(db.Text)    # JSON detailed feedback
    tone_check = db.Column(db.Text)                 # tone and formality result
    contradiction_check = db.Column(db.Text)        # contradiction result
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'essay_id': self.essay_id,
            'scholarship_id': self.scholarship_id,
            'overall_score': self.overall_score,
            'criterion_scores': json.loads(self.criterion_scores_json) if self.criterion_scores_json else {},
            'matched_requirements': json.loads(self.matched_requirements) if self.matched_requirements else [],
            'missing_requirements': json.loads(self.missing_requirements) if self.missing_requirements else [],
            'weaknesses': json.loads(self.weaknesses) if self.weaknesses else [],
            'revision_suggestions': json.loads(self.revision_suggestions) if self.revision_suggestions else [],
            'paragraph_feedback': json.loads(self.paragraph_feedback_json) if self.paragraph_feedback_json else [],
            'tone_check': self.tone_check,
            'contradiction_check': self.contradiction_check,
            'created_at': self.created_at.isoformat()
        }


class EligibilityResult(db.Model):
    __tablename__ = 'eligibility_results'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scholarship_id = db.Column(db.Integer, db.ForeignKey('scholarships.id'), nullable=False)
    eligible = db.Column(db.Boolean)
    passed_criteria = db.Column(db.Text)   # JSON list
    failed_criteria = db.Column(db.Text)   # JSON list
    warnings = db.Column(db.Text)          # JSON list
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'scholarship_id': self.scholarship_id,
            'eligible': self.eligible,
            'passed_criteria': json.loads(self.passed_criteria) if self.passed_criteria else [],
            'failed_criteria': json.loads(self.failed_criteria) if self.failed_criteria else [],
            'warnings': json.loads(self.warnings) if self.warnings else [],
            'created_at': self.created_at.isoformat()
        }


class ScholarshipMatch(db.Model):
    __tablename__ = 'scholarship_matches'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scholarship_id = db.Column(db.Integer, db.ForeignKey('scholarships.id'), nullable=False)
    fit_score = db.Column(db.Float)
    match_reason = db.Column(db.Text)
    risk_note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'scholarship_id': self.scholarship_id,
            'fit_score': self.fit_score,
            'match_reason': self.match_reason,
            'risk_note': self.risk_note,
            'created_at': self.created_at.isoformat()
        }


class ReshapedContent(db.Model):
    __tablename__ = 'reshaped_contents'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    source_essay_id = db.Column(db.Integer, db.ForeignKey('essays.id'), nullable=False)
    scholarship_id = db.Column(db.Integer, db.ForeignKey('scholarships.id'), nullable=True)
    target_question = db.Column(db.Text)
    word_limit = db.Column(db.Integer)
    reshaped_text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'source_essay_id': self.source_essay_id,
            'scholarship_id': self.scholarship_id,
            'target_question': self.target_question,
            'word_limit': self.word_limit,
            'reshaped_text': self.reshaped_text,
            'created_at': self.created_at.isoformat()
        }


class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scholarship_id = db.Column(db.Integer, db.ForeignKey('scholarships.id'), nullable=False)
    essay_id = db.Column(db.Integer, db.ForeignKey('essays.id'), nullable=True)
    # draft → reviewed → needs_improvement → ready_to_submit → submitted → shortlisted → rejected → accepted
    status = db.Column(db.String(50), default='draft')
    latest_score = db.Column(db.Float)
    readiness_score = db.Column(db.Float)
    deadline = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scholarship = db.relationship('Scholarship')
    essay = db.relationship('Essay')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'scholarship_id': self.scholarship_id,
            'essay_id': self.essay_id,
            'status': self.status,
            'latest_score': self.latest_score,
            'readiness_score': self.readiness_score,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    document_type = db.Column(db.String(50))   # IC, transcript, certificate, income_proof, resume, recommendation_letter
    filename = db.Column(db.String(200))
    file_url = db.Column(db.String(500))
    is_certified = db.Column(db.Boolean, default=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'document_type': self.document_type,
            'filename': self.filename,
            'file_url': self.file_url,
            'is_certified': self.is_certified,
            'uploaded_at': self.uploaded_at.isoformat()
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50))   # deadline, missing_doc, eligibility_failed, eval_ready, score_improved, status_update, doc_expiry
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }
