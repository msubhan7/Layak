"""
models.py — All database tables for the scholarship/uni application platform.
Each class = one table. SQLAlchemy handles the SQL for you.
"""

from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db


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

class University(db.Model):
    __tablename__ = "universities"

    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
        }

    def __repr__(self):
        return f"<University {self.name}>"

# ─────────────────────────────────────────────
# ESSAY EVALUATIONS — AI evaluation of each essay
# ─────────────────────────────────────────────
class EssayEvaluation(db.Model):
    __tablename__ = "essay_evaluations"
 
    id                    = db.Column(db.Integer, primary_key=True)
    essay_id              = db.Column(db.Integer, db.ForeignKey("essays.id"), nullable=False)
    scholarship_id        = db.Column(db.Integer, db.ForeignKey("scholarships.id"), nullable=False)
    overall_score         = db.Column(db.Float)               # e.g. 7.5 out of 10
    criterion_scores_json = db.Column(db.JSON)                # {"clarity": 8, "relevance": 9, ...}
    matched_requirements  = db.Column(db.JSON, default=list)  # requirements the essay addresses
    missing_requirements  = db.Column(db.JSON, default=list)  # requirements not addressed
    weaknesses            = db.Column(db.JSON, default=list)  # list of weak points
    revision_suggestions  = db.Column(db.JSON, default=list)  # list of improvement tips
    paragraph_feedback_json = db.Column(db.JSON)              # per-paragraph AI feedback
    created_at            = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
 
    essay       = db.relationship("Essay",       backref="evaluations")
    scholarship = db.relationship("Scholarship", backref="essay_evaluations")
 
    def to_dict(self):
        return {
            "id": self.id,
            "essay_id": self.essay_id,
            "scholarship_id": self.scholarship_id,
            "overall_score": self.overall_score,
            "criterion_scores_json": self.criterion_scores_json,
            "matched_requirements": self.matched_requirements or [],
            "missing_requirements": self.missing_requirements or [],
            "weaknesses": self.weaknesses or [],
            "revision_suggestions": self.revision_suggestions or [],
            "paragraph_feedback_json": self.paragraph_feedback_json,
            "created_at": str(self.created_at),
        }
 
    def __repr__(self):
        return f"<EssayEvaluation essay={self.essay_id} score={self.overall_score}>"
 
 
# ─────────────────────────────────────────────
# ELIGIBILITY RESULTS — AI eligibility check per user per scholarship
# ─────────────────────────────────────────────
class EligibilityResult(db.Model):
    __tablename__ = "eligibility_results"
 
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    scholarship_id = db.Column(db.Integer, db.ForeignKey("scholarships.id"), nullable=False)
    eligible       = db.Column(db.Boolean)                    # True / False
    passed_criteria = db.Column(db.JSON, default=list)        # criteria the student meets
    failed_criteria = db.Column(db.JSON, default=list)        # criteria the student fails
    warnings       = db.Column(db.JSON, default=list)         # borderline issues to note
    created_at     = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
 
    user        = db.relationship("User",        backref="eligibility_results")
    scholarship = db.relationship("Scholarship", backref="eligibility_results")
 
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "scholarship_id": self.scholarship_id,
            "eligible": self.eligible,
            "passed_criteria": self.passed_criteria or [],
            "failed_criteria": self.failed_criteria or [],
            "warnings": self.warnings or [],
            "created_at": str(self.created_at),
        }
 
    def __repr__(self):
        return f"<EligibilityResult user={self.user_id} scholarship={self.scholarship_id} eligible={self.eligible}>"
 
 
# ─────────────────────────────────────────────
# SCHOLARSHIP MATCHES — AI-ranked scholarship matches per user
# ─────────────────────────────────────────────
class ScholarshipMatch(db.Model):
    __tablename__ = "scholarship_matches"
 
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    scholarship_id = db.Column(db.Integer, db.ForeignKey("scholarships.id"), nullable=False)
    fit_score      = db.Column(db.Float)        # 1–10 match score from AI
    match_reason   = db.Column(db.Text)         # why this is a good match
    risk_note      = db.Column(db.Text)         # any risks or concerns
    created_at     = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
 
    user        = db.relationship("User",        backref="scholarship_matches")
    scholarship = db.relationship("Scholarship", backref="scholarship_matches")
 
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "scholarship_id": self.scholarship_id,
            "fit_score": self.fit_score,
            "match_reason": self.match_reason,
            "risk_note": self.risk_note,
            "created_at": str(self.created_at),
        }
 
    def __repr__(self):
        return f"<ScholarshipMatch user={self.user_id} scholarship={self.scholarship_id} score={self.fit_score}>"
 
 
# ─────────────────────────────────────────────
# NOTIFICATIONS — in-app notifications per user
# ─────────────────────────────────────────────
class Notification(db.Model):
    __tablename__ = "notifications"
 
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message    = db.Column(db.Text, nullable=False)   # "Your essay scored 8.5/10!"
    type       = db.Column(db.String(50))             # "essay" / "eligibility" / "deadline" / "match"
    is_read    = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
 
    user = db.relationship("User", backref="notifications")
 
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": str(self.created_at),
        }
 
    def __repr__(self):
        return f"<Notification user={self.user_id} type={self.type} read={self.is_read}>"
 
 
# ─────────────────────────────────────────────
# RESHAPED CONTENTS — AI reshaped essays for different scholarships
# ─────────────────────────────────────────────
class ReshapedContent(db.Model):
    __tablename__ = "reshaped_contents"
 
    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    source_essay_id  = db.Column(db.Integer, db.ForeignKey("essays.id"), nullable=False)
    scholarship_id   = db.Column(db.Integer, db.ForeignKey("scholarships.id"), nullable=False)
    target_question  = db.Column(db.Text)       # the new question this essay is reshaped for
    word_limit       = db.Column(db.Integer)    # word limit of the target question
    reshaped_text    = db.Column(db.Text)       # the AI-reshaped essay content
    created_at       = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
 
    user         = db.relationship("User",        backref="reshaped_contents")
    source_essay = db.relationship("Essay",       backref="reshaped_contents")
    scholarship  = db.relationship("Scholarship", backref="reshaped_contents")
 
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "source_essay_id": self.source_essay_id,
            "scholarship_id": self.scholarship_id,
            "target_question": self.target_question,
            "word_limit": self.word_limit,
            "reshaped_text": self.reshaped_text,
            "created_at": str(self.created_at),
        }
 
    def __repr__(self):
        return f"<ReshapedContent user={self.user_id} scholarship={self.scholarship_id}>"
