"""
data_helpers.py — All database operations in one place.
Your teammates import functions from here instead of writing raw SQLAlchemy queries.

Usage example:
    from data_helpers import get_user_by_email, create_application, update_essay_ai_score
"""

from datetime import datetime, timezone
from models import db, User, Profile, Scholarship, Document, Application, Essay


# ══════════════════════════════════════════════
# USER HELPERS
# ══════════════════════════════════════════════

def create_user(email: str, password: str) -> User:
    """Create a new user. Password is hashed automatically."""
    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user


def get_user_by_id(user_id: int) -> User | None:
    return User.query.get(user_id)


def get_user_by_email(email: str) -> User | None:
    return User.query.filter_by(email=email).first()


def delete_user(user_id: int) -> bool:
    user = User.query.get(user_id)
    if not user:
        return False
    db.session.delete(user)
    db.session.commit()
    return True


# ══════════════════════════════════════════════
# PROFILE HELPERS
# ══════════════════════════════════════════════

def create_or_update_profile(user_id: int, data: dict) -> Profile:
    """
    Upsert a profile — creates it if it doesn't exist, updates if it does.
    Pass only the fields you want to update in `data`.

    Example:
        create_or_update_profile(1, {"cgpa": 3.85, "course": "Computer Science"})
    """
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.session.add(profile)

    allowed_fields = [
        "full_name", "ic_number", "race", "citizenship", "cgpa",
        "course", "university", "year_of_study", "family_income",
        "achievements", "extracurriculars", "bio",
    ]
    for field in allowed_fields:
        if field in data:
            setattr(profile, field, data[field])

    profile.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return profile


def get_profile(user_id: int) -> Profile | None:
    return Profile.query.filter_by(user_id=user_id).first()


# ══════════════════════════════════════════════
# SCHOLARSHIP HELPERS
# ══════════════════════════════════════════════

def get_all_scholarships() -> list[Scholarship]:
    return Scholarship.query.all()


def get_scholarship_by_id(scholarship_id: int) -> Scholarship | None:
    return Scholarship.query.get(scholarship_id)


def search_scholarships(
    min_cgpa: float = None,
    open_to: str = None,
    field_of_study: str = None,
) -> list[Scholarship]:
    """
    Filter scholarships by criteria.
    Example:
        search_scholarships(min_cgpa=3.5, open_to="All Malaysians", field_of_study="STEM")
    """
    query = Scholarship.query
    if min_cgpa is not None:
        # Return scholarships where student's CGPA meets the requirement
        query = query.filter(
            (Scholarship.min_cgpa == None) | (Scholarship.min_cgpa <= min_cgpa)
        )
    if open_to:
        query = query.filter(
            (Scholarship.open_to == "All Malaysians") | (Scholarship.open_to == open_to)
        )
    if field_of_study:
        query = query.filter(
            (Scholarship.field_of_study == "Any") | (Scholarship.field_of_study == field_of_study)
        )
    return query.all()


def get_scholarships_for_student(user_id: int) -> list[Scholarship]:
    """
    Returns scholarships the student is eligible for based on their profile.
    Convenience wrapper around search_scholarships.
    """
    profile = get_profile(user_id)
    if not profile:
        return get_all_scholarships()

    return search_scholarships(
        min_cgpa=profile.cgpa,
        open_to=profile.race,   # rough match; AI does the precise check
        field_of_study=profile.course,
    )


# ══════════════════════════════════════════════
# DOCUMENT HELPERS
# ══════════════════════════════════════════════

def add_document(
    user_id: int,
    doc_type: str,
    filename: str,
    filepath: str,
    is_certified: bool = False,
) -> Document:
    doc = Document(
        user_id=user_id,
        doc_type=doc_type,
        filename=filename,
        filepath=filepath,
        is_certified=is_certified,
    )
    db.session.add(doc)
    db.session.commit()
    return doc


def get_documents_for_user(user_id: int) -> list[Document]:
    return Document.query.filter_by(user_id=user_id).all()


def get_documents_by_type(user_id: int, doc_type: str) -> list[Document]:
    return Document.query.filter_by(user_id=user_id, doc_type=doc_type).all()


def delete_document(doc_id: int, user_id: int) -> bool:
    """Only deletes if the doc belongs to this user (security check)."""
    doc = Document.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doc:
        return False
    db.session.delete(doc)
    db.session.commit()
    return True


# ══════════════════════════════════════════════
# APPLICATION HELPERS
# ══════════════════════════════════════════════

def create_application(user_id: int, scholarship_id: int) -> Application | None:
    """
    Start tracking a scholarship. Returns None if already applied.
    """
    existing = Application.query.filter_by(
        user_id=user_id, scholarship_id=scholarship_id
    ).first()
    if existing:
        return None  # already exists

    app = Application(user_id=user_id, scholarship_id=scholarship_id, status="tracking")
    db.session.add(app)
    db.session.commit()
    return app


def get_applications_for_user(user_id: int) -> list[Application]:
    return Application.query.filter_by(user_id=user_id).all()


def get_application_by_id(application_id: int) -> Application | None:
    return Application.query.get(application_id)


def update_application_status(application_id: int, status: str) -> Application | None:
    valid_statuses = ["tracking", "in_progress", "submitted", "shortlisted", "rejected"]
    if status not in valid_statuses:
        raise ValueError(f"Invalid status '{status}'. Must be one of {valid_statuses}")

    app = Application.query.get(application_id)
    if not app:
        return None
    app.status = status
    app.last_updated = datetime.now(timezone.utc)
    db.session.commit()
    return app


def save_eligibility_result(application_id: int, result: dict, fit_score: float) -> Application | None:
    """
    Called by the AI eligibility checker to store its output.
    `result` is the full JSON breakdown, `fit_score` is the 1–10 number.
    """
    app = Application.query.get(application_id)
    if not app:
        return None
    app.eligibility_result = result
    app.fit_score = fit_score
    app.last_updated = datetime.now(timezone.utc)
    db.session.commit()
    return app


# ══════════════════════════════════════════════
# ESSAY HELPERS
# ══════════════════════════════════════════════

def create_essay(application_id: int, question: str, content: str = "") -> Essay:
    essay = Essay(
        application_id=application_id,
        question=question,
        content=content,
        word_count=len(content.split()) if content else 0,
    )
    db.session.add(essay)
    db.session.commit()
    return essay


def update_essay_content(essay_id: int, content: str) -> Essay | None:
    essay = Essay.query.get(essay_id)
    if not essay:
        return None
    essay.content = content
    essay.word_count = len(content.split())
    essay.last_edited = datetime.now(timezone.utc)
    db.session.commit()
    return essay


def save_essay_ai_feedback(essay_id: int, ai_score: float, ai_feedback: dict) -> Essay | None:
    """
    Called by the AI essay scorer to store the score and feedback breakdown.
    `ai_feedback` is a JSON dict like:
    {
        "clarity": 8,
        "relevance": 9,
        "originality": 7,
        "suggestions": ["Add more specific examples", "Shorten the intro"]
    }
    """
    essay = Essay.query.get(essay_id)
    if not essay:
        return None
    essay.ai_score = ai_score
    essay.ai_feedback = ai_feedback
    essay.last_edited = datetime.now(timezone.utc)
    db.session.commit()
    return essay


def get_essays_for_application(application_id: int) -> list[Essay]:
    return Essay.query.filter_by(application_id=application_id).all()


def initialise_essays_for_application(application_id: int) -> list[Essay]:
    """
    Automatically creates one Essay row per question in the scholarship's essay_prompts.
    Call this when a user moves from "tracking" to "in_progress".
    """
    application = get_application_by_id(application_id)
    if not application:
        return []

    scholarship = get_scholarship_by_id(application.scholarship_id)
    if not scholarship or not scholarship.essay_prompts:
        return []

    essays = []
    for question in scholarship.essay_prompts:
        existing = Essay.query.filter_by(
            application_id=application_id, question=question
        ).first()
        if not existing:
            essay = create_essay(application_id, question)
            essays.append(essay)

    return essays
