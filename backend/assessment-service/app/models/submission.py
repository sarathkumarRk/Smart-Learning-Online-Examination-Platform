from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    JSON
)
from sqlalchemy.sql import func

from app.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id"),
        nullable=False,
        index=True
    )

    student_id = Column(Integer, nullable=False, index=True)

    answers = Column(JSON, nullable=False)

    score = Column(Integer, nullable=False, default=0)
    total_marks = Column(Integer, nullable=False)

    submitted_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )