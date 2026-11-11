from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id"),
        nullable=False,
        index=True
    )

    question_text = Column(Text, nullable=False)

    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)

    correct_option = Column(String(1), nullable=False)

    marks = Column(Integer, nullable=False, default=1)