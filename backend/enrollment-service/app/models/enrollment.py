import enum

from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    Enum,
    UniqueConstraint
)
from sqlalchemy.sql import func

from app.database import Base


class EnrollmentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Enrollment(Base):
    __tablename__ = "enrollments"

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "course_id",
            name="unique_student_course"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, nullable=False, index=True)

    course_id = Column(Integer, nullable=False, index=True)

    status = Column(
        Enum(EnrollmentStatus),
        default=EnrollmentStatus.ACTIVE,
        nullable=False
    )

    enrolled_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
