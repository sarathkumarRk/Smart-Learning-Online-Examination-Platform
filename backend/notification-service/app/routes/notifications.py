from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import admin_required

from app.schemas.notification import (
    NotificationCreate,
    BulkNotificationCreate,
    NotificationResponse
)

from app.services.notification_service import (
    create_notification,
    create_bulk_notifications,
    get_all_notifications,
    get_notification_by_id
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post(
    "/send",
    response_model=NotificationResponse
)
def send_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db)
):
    return create_notification(
        data,
        db
    )


@router.post(
    "/send-bulk",
    response_model=list[NotificationResponse]
)
def send_bulk_notifications(
    data: BulkNotificationCreate,
    db: Session = Depends(get_db)
):
    if not data.recipient_emails:
        raise HTTPException(
            status_code=400,
            detail="At least one recipient email is required"
        )

    return create_bulk_notifications(
        data.recipient_emails,
        data.subject,
        data.message,
        data.notification_type,
        db
    )


@router.get(
    "/",
    response_model=list[NotificationResponse]
)
def list_notifications(
    user: dict = Depends(admin_required),
    db: Session = Depends(get_db)
):
    return get_all_notifications(db)


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse
)
def notification_details(
    notification_id: int,
    user: dict = Depends(admin_required),
    db: Session = Depends(get_db)
):
    notification = get_notification_by_id(
        notification_id,
        db
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification
