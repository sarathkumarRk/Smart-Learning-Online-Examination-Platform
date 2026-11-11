from datetime import datetime
from typing import Dict

from pydantic import BaseModel, Field


class SubmissionCreate(BaseModel):
    answers: Dict[int, str]


class SubmissionResponse(BaseModel):
    id: int
    assessment_id: int
    student_id: int
    answers: Dict[int, str]
    score: int
    total_marks: int
    submitted_at: datetime

    class Config:
        from_attributes = True