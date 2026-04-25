from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///layak.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

    db.init_app(app)

    # Register all blueprints
    from routes.auth import auth_bp
    from routes.profile import profile_bp
    from routes.scholarships import scholarships_bp, universities_bp
    from routes.essays import essays_bp
    from routes.documents import documents_bp
    from routes.ai_routes import ai_bp
    from routes.applications import applications_bp
    from routes.dashboard import dashboard_bp
    from routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(profile_bp, url_prefix='/profile')
    app.register_blueprint(scholarships_bp, url_prefix='/scholarships')
    app.register_blueprint(universities_bp, url_prefix='/universities')
    app.register_blueprint(essays_bp, url_prefix='/essays')
    app.register_blueprint(documents_bp, url_prefix='/documents')
    app.register_blueprint(ai_bp, url_prefix='/ai')
    # Spec requires top-level aliases: GET /evaluations/{essay_id},
    # GET /eligibility/{scholarship_id}, GET /matches
    from routes.ai_routes import evaluations_bp, eligibility_bp, matches_bp
    app.register_blueprint(evaluations_bp, url_prefix='/evaluations')
    app.register_blueprint(eligibility_bp, url_prefix='/eligibility')
    app.register_blueprint(matches_bp, url_prefix='/matches')
    app.register_blueprint(applications_bp, url_prefix='/applications')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(notifications_bp, url_prefix='/notifications')

    with app.app_context():
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
