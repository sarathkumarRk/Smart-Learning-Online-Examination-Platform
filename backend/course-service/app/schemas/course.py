from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Create Course Schema
class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    duration: int


# Update Course Schema
class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    duration: Optional[int] = None


# Course Response Schema
class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    duration: int
    instructor_id: int
    is_published: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
