from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AssessmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: int
    duration_minutes: int = Field(gt=0)
    allow_retakes: bool = False
    deadline: Optional[datetime] = None


class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = Field(default=None, gt=0)
    allow_retakes: Optional[bool] = None
    deadline: Optional[datetime] = None


class AssessmentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    course_id: int
    instructor_id: int
    duration_minutes: int
    total_marks: int
    allow_retakes: bool
    is_published: bool
    deadline: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True