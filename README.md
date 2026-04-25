# 🎓 ScholarEasy — Data Layer Setup Guide

## What You're Building
An all-in-one platform for Malaysian students to find, apply for, and track scholarships + university applications.

---

## 📁 File Overview

| File | What it does |
|---|---|
| `models.py` | All database table definitions (User, Profile, Scholarship, Document, Application, Essay) |
| `app.py` | Flask app factory — starts the server, creates the DB |
| `data_helpers.py` | All query functions — teammates import these, not raw SQLAlchemy |
| `seed.py` | Fills the scholarships table with 8 real Malaysian scholarships |
| `requirements.txt` | Python packages to install |

---

## 🛠️ Software to Install

### 1. Python 3.11+
Download from https://www.python.org/downloads/

### 2. VS Code (recommended IDE)
Download from https://code.visualstudio.com/

### 3. That's it for the hackathon — SQLite is built into Python, no extra DB software needed!

---

## ⚡ First-Time Setup (run these once)

```bash
# 1. Create a virtual environment (keeps packages isolated)
python -m venv venv

# 2. Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install packages
pip install -r requirements.txt

# 4. Start the server (this also creates scholarship.db automatically)
python app.py

# 5. In a separate terminal, seed the scholarships data
python seed.py
```

After this you'll see `scholarship.db` appear in your folder — that's your entire database as a single file. ✅

---

## 👥 How Your Teammates Use Your Work

Tell them to import from `data_helpers.py`:

```python
from data_helpers import (
    create_user,
    get_user_by_email,
    create_or_update_profile,
    get_scholarships_for_student,
    create_application,
    update_application_status,
    save_eligibility_result,   # called by whoever builds the AI checker
    save_essay_ai_feedback,    # called by whoever builds the AI essay scorer
)
```

### Examples for the frontend/backend teammate:

```python
# Register a new user
user = create_user("ali@gmail.com", "mypassword123")

# Update their profile
create_or_update_profile(user.id, {
    "full_name": "Muhammad Ali bin Hassan",
    "cgpa": 3.85,
    "course": "Computer Science",
    "university": "Universiti Malaya",
    "race": "Malay",
    "citizenship": "Malaysian",
})

# Get scholarships they're eligible for
scholarships = get_scholarships_for_student(user.id)

# Start tracking a scholarship (scholarship_id=1 is Khazanah)
application = create_application(user.id, scholarship_id=1)

# Move to in_progress + auto-create essay slots
update_application_status(application.id, "in_progress")
initialise_essays_for_application(application.id)
```

### Example for the AI teammate:

```python
# After AI checks eligibility:
save_eligibility_result(application.id,
    result={"eligible": True, "reason": "CGPA meets requirement, open to all races"},
    fit_score=8.5
)

# After AI scores an essay:
save_essay_ai_feedback(essay.id,
    ai_score=7.8,
    ai_feedback={
        "clarity": 8,
        "relevance": 9,
        "originality": 7,
        "grammar": 8,
        "suggestions": [
            "Add more specific examples of your leadership experience.",
            "The conclusion could be stronger — tie back to your career goals.",
        ]
    }
)
```

---

## 🗺️ Database Relationships

```
users
 ├── profiles       (1 user = 1 profile)
 ├── documents      (1 user = many docs)
 └── applications   (1 user = many applications)
       ├── scholarships  (many applications → 1 scholarship)
       └── essays        (1 application = many essays, one per question)
```

---

## 🔄 Switching to PostgreSQL Later (after hackathon)

Change just ONE line in `app.py`:
```python
# Before (SQLite):
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///scholarship.db"

# After (PostgreSQL):
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://username:password@localhost/scholardb"
```

Everything else stays the same.

---

## 🐛 Common Issues

**`ModuleNotFoundError: No module named 'flask'`**
→ Make sure your virtual environment is activated (`venv\Scripts\activate`)

**`scholarship.db` not showing up**
→ Run `python app.py` first — it creates the DB on startup

**Want to reset the database**
→ Delete `scholarship.db` and run `python app.py` then `python seed.py` again
