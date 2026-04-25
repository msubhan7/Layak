from extensions import db
from models import Notification

# Maps each application status to a user-friendly notification message
STATUS_MESSAGES = {
    'draft':              'Your application has been saved as a draft.',
    'reviewed':           'Your application has been reviewed.',
    'needs_improvement':  'Your application needs improvement before submission.',
    'ready_to_submit':    'Your application is ready to submit!',
    'submitted':          'Your application has been submitted successfully.',
    'shortlisted':        'Congratulations! You have been shortlisted.',
    'rejected':           'Your application was not successful this time.',
    'accepted':           'Congratulations! Your application has been accepted!'
}


def notify_status_update(user_id: int, scholarship_title: str, new_status: str):
    """
    Creates a notification record when an application status changes.
    The frontend can poll GET /notifications to display these as popups.
    """
    message_template = STATUS_MESSAGES.get(new_status, f'Your application status changed to: {new_status}')
    message = f'{scholarship_title}: {message_template}'

    notification = Notification(
        user_id=user_id,
        message=message,
        type='status_update',
        is_read=False
    )
    db.session.add(notification)
    db.session.commit()
