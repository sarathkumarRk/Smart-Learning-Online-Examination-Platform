from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.models.enrollment import EnrollmentStatus


# Create Enrollment Schema
class EnrollmentCreate(BaseModel):
    course_id: int


# Enrollment Status Update Schema
class EnrollmentStatusUpdate(BaseModel):
    status: EnrollmentStatus


# Enrollment Response Schema
class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: EnrollmentStatus
    enrolled_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Enrolled Course Response Schema
class MyCourseResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    duration: int
    is_published: bool
    enrollment_status: EnrollmentStatus
    enrolled_at: datetime
