from datetime import datetime
from typing import List

from pydantic import BaseModel, EmailStr


class NotificationCreate(BaseModel):
    recipient_email: EmailStr
    subject: str
    message: str
    notification_type: str


class BulkNotificationCreate(BaseModel):
    recipient_emails: List[EmailStr]
    subject: str
    message: str
    notification_type: str


class NotificationResponse(BaseModel):
    id: int
    recipient_email: str
    subject: str
    message: str
    notification_type: str
    status: str
    error_message: str | None
    created_at: datetime

    class Config:
        from_attributes = True
