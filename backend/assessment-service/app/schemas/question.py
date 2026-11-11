from pydantic import BaseModel, Field
from typing import List


class QuestionCreate(BaseModel):
    question_text: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    correct_option: str = Field(pattern="^[ABCD]$")

    marks: int = Field(default=1, gt=0)


class QuestionResponse(BaseModel):
    id: int
    assessment_id: int
    question_text: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    marks: int

    class Config:
        from_attributes = True


class QuestionListResponse(BaseModel):
    questions: List[QuestionResponse]