from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    recipient_email = Column(String(150), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)

    notification_type = Column(String(100), nullable=False)

    status = Column(String(20), nullable=False, default="PENDING")

    error_message = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
