from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)

    course_id = Column(Integer, nullable=False, index=True)
    instructor_id = Column(Integer, nullable=False, index=True)

    duration_minutes = Column(Integer, nullable=False)
    total_marks = Column(Integer, nullable=False, default=0)

    allow_retakes = Column(Boolean, default=False, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)

    deadline = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )