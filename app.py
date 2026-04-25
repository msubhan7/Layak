"""
app.py — Flask app factory. Run this file to start the server.
"""
import os
from flask import Flask
from models import db
from flask_cors import CORS


def create_app():
    app = Flask(__name__)

    # ── Database config ──────────────────────────────────────────────────────
    # SQLite for the hackathon — file-based, zero setup, no server needed.
    # To switch to PostgreSQL later just swap this one line:
    #   app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://user:pass@localhost/scholardb"
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///scholarship.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "change-this-before-going-live"  # used by Flask sessions

    CORS(app)                        # ← NEW: allows React (port 3000) to call Flask (port 5000)
    db.init_app(app)

    # ── Register blueprints (routes) here later ───────────────────────────────
    from routes.auth         import auth_bp
    from routes.scholarships import scholarships_bp
    from routes.profile      import profile_bp
    from routes.applications import applications_bp

    app.register_blueprint(auth_bp,          url_prefix="/auth")
    app.register_blueprint(scholarships_bp,  url_prefix="/scholarships")
    app.register_blueprint(profile_bp,       url_prefix="/profile")
    app.register_blueprint(applications_bp,  url_prefix="/applications")

    # ── Create all tables on first run ────────────────────────────────────────
    with app.app_context():
        db.create_all()
        print("✅ Database tables created (or already exist).")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
