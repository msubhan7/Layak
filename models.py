<<<<<<< HEAD
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
=======
"""
models.py — All database tables for the scholarship/uni application platform.
Each class = one table. SQLAlchemy handles the SQL for you.
"""

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


# ─────────────────────────────────────────────
# USERS — login credentials only
# ─────────────────────────────────────────────
class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships — lets you do user.profile, user.documents, user.applications
    profile      = db.relationship("Profile",     back_populates="user", uselist=False, cascade="all, delete-orphan")
    documents    = db.relationship("Document",    back_populates="user", cascade="all, delete-orphan")
    applications = db.relationship("Application", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str):
        """Hash and store the password. Never store plaintext."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Returns True if the password matches the stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "email": self.email, "created_at": str(self.created_at)}

    def __repr__(self):
        return f"<User {self.email}>"


# ─────────────────────────────────────────────
# PROFILES — the "fill once" personal info core
# ─────────────────────────────────────────────
class Profile(db.Model):
    __tablename__ = "profiles"

    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)

    full_name       = db.Column(db.String(255))
    ic_number       = db.Column(db.String(20))          # Malaysian IC, e.g. "990101-14-1234"
    race            = db.Column(db.String(50))           # Malay / Chinese / Indian / Other
    citizenship     = db.Column(db.String(50))           # Malaysian / PR / etc.
    cgpa            = db.Column(db.Float)                # e.g. 3.85
    course          = db.Column(db.String(255))          # e.g. "Computer Science"
    university      = db.Column(db.String(255))          # e.g. "Universiti Malaya"
    year_of_study   = db.Column(db.Integer)              # 1, 2, 3 …
    family_income   = db.Column(db.Float)                # monthly household income (RM)

    # JSON columns — stored as text, automatically serialised/deserialised
    achievements    = db.Column(db.JSON, default=list)   # ["Dean's List 2023", "MSSD swimmer"]
    extracurriculars= db.Column(db.JSON, default=list)   # ["Debate Club", "Volleyball captain"]

    bio             = db.Column(db.Text)                 # main personal statement, written once
    updated_at      = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                                onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="profile")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "ic_number": self.ic_number,
            "race": self.race,
            "citizenship": self.citizenship,
            "cgpa": self.cgpa,
            "course": self.course,
            "university": self.university,
            "year_of_study": self.year_of_study,
            "family_income": self.family_income,
            "achievements": self.achievements or [],
            "extracurriculars": self.extracurriculars or [],
            "bio": self.bio,
            "updated_at": str(self.updated_at),
        }

    def __repr__(self):
        return f"<Profile {self.full_name}>"


# ─────────────────────────────────────────────
# SCHOLARSHIPS — master list of all scholarships
# ─────────────────────────────────────────────
class Scholarship(db.Model):
    __tablename__ = "scholarships"

    id                  = db.Column(db.Integer, primary_key=True)
    name                = db.Column(db.String(255), nullable=False)   # "Yayasan Khazanah Scholarship"
    provider            = db.Column(db.String(255))                   # "Khazanah Nasional"
    amount              = db.Column(db.String(100))                   # "RM 60,000/year" (string, flexible)
    deadline            = db.Column(db.Date)

    # Full text eligibility criteria — the AI reads this to check if student qualifies
    eligibility_criteria = db.Column(db.Text)

    # JSON arrays
    essay_prompts       = db.Column(db.JSON, default=list)   # ["Why do you deserve this?", "Career goals?"]
    required_docs       = db.Column(db.JSON, default=list)   # ["transcript", "IC", "referee_letter"]

    min_cgpa            = db.Column(db.Float)
    open_to             = db.Column(db.String(100))          # "All Malaysians" / "Bumiputera"
    field_of_study      = db.Column(db.String(100))          # "Any" / "STEM" / "Medicine"
    portal_url          = db.Column(db.String(500))

    applications = db.relationship("Application", back_populates="scholarship", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "provider": self.provider,
            "amount": self.amount,
            "deadline": str(self.deadline) if self.deadline else None,
            "eligibility_criteria": self.eligibility_criteria,
            "essay_prompts": self.essay_prompts or [],
            "required_docs": self.required_docs or [],
            "min_cgpa": self.min_cgpa,
            "open_to": self.open_to,
            "field_of_study": self.field_of_study,
            "portal_url": self.portal_url,
        }

    def __repr__(self):
        return f"<Scholarship {self.name}>"


# ─────────────────────────────────────────────
# DOCUMENTS — uploaded files per user
# ─────────────────────────────────────────────
class Document(db.Model):
    __tablename__ = "documents"

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    doc_type     = db.Column(db.String(50))     # "transcript" / "IC" / "cert" / "referee_letter"
    filename     = db.Column(db.String(255))    # original filename shown to user
    filepath     = db.Column(db.String(500))    # actual path on server / cloud storage URL
    is_certified = db.Column(db.Boolean, default=False)   # certified true copy? Required by many unis
    uploaded_at  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="documents")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "doc_type": self.doc_type,
            "filename": self.filename,
            "filepath": self.filepath,
            "is_certified": self.is_certified,
            "uploaded_at": str(self.uploaded_at),
        }

    def __repr__(self):
        return f"<Document {self.doc_type} – {self.filename}>"


# ─────────────────────────────────────────────
# APPLICATIONS — the join between student + scholarship
# ─────────────────────────────────────────────
APPLICATION_STATUSES = ["tracking", "in_progress", "submitted", "shortlisted", "rejected"]

class Application(db.Model):
    __tablename__ = "applications"

    id                 = db.Column(db.Integer, primary_key=True)
    user_id            = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    scholarship_id     = db.Column(db.Integer, db.ForeignKey("scholarships.id"), nullable=False)

    # Status pipeline: tracking → in_progress → submitted → shortlisted / rejected
    status             = db.Column(db.String(20), default="tracking")

    # AI outputs stored as JSON
    eligibility_result = db.Column(db.JSON)   # full JSON from AI eligibility check
    fit_score          = db.Column(db.Float)  # 1–10 match score from AI

    last_updated       = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                                   onupdate=lambda: datetime.now(timezone.utc))

    user        = db.relationship("User",        back_populates="applications")
    scholarship = db.relationship("Scholarship", back_populates="applications")
    essays      = db.relationship("Essay",       back_populates="application", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "scholarship_id": self.scholarship_id,
            "status": self.status,
            "eligibility_result": self.eligibility_result,
            "fit_score": self.fit_score,
            "last_updated": str(self.last_updated),
        }

    def __repr__(self):
        return f"<Application user={self.user_id} scholarship={self.scholarship_id} status={self.status}>"


# ─────────────────────────────────────────────
# ESSAYS — one row per scholarship question per application
# ─────────────────────────────────────────────
class Essay(db.Model):
    __tablename__ = "essays"

    id             = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey("applications.id"), nullable=False)

    question    = db.Column(db.Text)    # the specific prompt this essay answers
    content     = db.Column(db.Text)    # what the student wrote
    ai_score    = db.Column(db.Float)   # overall AI score out of 10
    ai_feedback = db.Column(db.JSON)    # full JSON breakdown per criterion
    word_count  = db.Column(db.Integer)
    last_edited = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                            onupdate=lambda: datetime.now(timezone.utc))

    application = db.relationship("Application", back_populates="essays")

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "question": self.question,
            "content": self.content,
            "ai_score": self.ai_score,
            "ai_feedback": self.ai_feedback,
            "word_count": self.word_count,
            "last_edited": str(self.last_edited),
        }

    def __repr__(self):
        return f"<Essay app={self.application_id} score={self.ai_score}>"
>>>>>>> 6bb11968b8d1cd29537d52571bfd2e7f78772dd9
