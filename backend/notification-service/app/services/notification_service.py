from sqlalchemy.orm import Session

from app.models import Notification
from app.schemas.notification import NotificationCreate

from app.services.email_service import send_email


def create_notification(
    data: NotificationCreate,
    db: Session
):
    notification = Notification(
        recipient_email=str(data.recipient_email),
        subject=data.subject,
        message=data.message,
        notification_type=data.notification_type,
        status="PENDING"
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    success, error = send_email(
        notification.recipient_email,
        notification.subject,
        notification.message
    )

    if success:
        notification.status = "SENT"
        notification.error_message = None
    else:
        notification.status = "FAILED"
        notification.error_message = error

    db.commit()
    db.refresh(notification)

    return notification


def create_bulk_notifications(
    recipient_emails: list,
    subject: str,
    message: str,
    notification_type: str,
    db: Session
):
    notifications = []

    for recipient_email in recipient_emails:
        data = NotificationCreate(
            recipient_email=recipient_email,
            subject=subject,
            message=message,
            notification_type=notification_type
        )

        notification = create_notification(
            data,
            db
        )

        notifications.append(notification)

    return notifications


def get_all_notifications(db: Session):
    return db.query(Notification).order_by(
        Notification.created_at.desc()
    ).all()


def get_notification_by_id(
    notification_id: int,
    db: Session
):
    return db.query(Notification).filter(
        Notification.id == notification_id
    ).first()
