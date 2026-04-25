from flask import Blueprint, request, jsonify
from extensions import db
from models import Notification
from auth_utils import token_required

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('', methods=['GET'])
@token_required
def get_notifications(current_user):
    """
    Return all notifications for the current user, most recent first.
    Accepts optional ?unread_only=true to filter unread notifications.
    """
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'

    query = Notification.query.filter_by(user_id=current_user.id)
    if unread_only:
        query = query.filter_by(is_read=False)

    notifications = query.order_by(Notification.created_at.desc()).all()
    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()

    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    })


@notifications_bp.route('/mark-read', methods=['POST'])
@token_required
def mark_read(current_user):
    """
    Mark notifications as read.
    Body: { ids: [1, 2, 3] }  — mark specific notifications.
    Body: {}                   — mark ALL unread notifications as read.
    """
    data = request.get_json() or {}
    notification_ids = data.get('ids', [])

    if notification_ids:
        Notification.query.filter(
            Notification.id.in_(notification_ids),
            Notification.user_id == current_user.id
        ).update({'is_read': True}, synchronize_session=False)
    else:
        Notification.query.filter_by(
            user_id=current_user.id,
            is_read=False
        ).update({'is_read': True}, synchronize_session=False)

    db.session.commit()
    return jsonify({'message': 'Notifications marked as read'})

