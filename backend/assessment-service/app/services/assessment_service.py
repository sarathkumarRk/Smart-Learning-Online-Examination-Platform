from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Assessment, Question
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate
from app.schemas.question import QuestionCreate


def create_assessment(
    data: AssessmentCreate,
    instructor_id: int,
    db: Session
):
    assessment = Assessment(
        title=data.title,
        description=data.description,
        course_id=data.course_id,
        instructor_id=instructor_id,
        duration_minutes=data.duration_minutes,
        allow_retakes=data.allow_retakes,
        deadline=data.deadline,
        total_marks=0,
        is_published=False
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment


def get_instructor_assessments(
    instructor_id: int,
    db: Session
):
    return db.query(Assessment).filter(
        Assessment.instructor_id == instructor_id
    ).all()


def get_published_assessments(
    course_id: int,
    db: Session
):
    return db.query(Assessment).filter(
        Assessment.course_id == course_id,
        Assessment.is_published == True
    ).all()


def get_assessment_by_id(
    assessment_id: int,
    db: Session
):
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    return assessment


def check_assessment_owner(
    assessment: Assessment,
    instructor_id: int
):
    if assessment.instructor_id != instructor_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot manage this assessment"
        )


def update_assessment(
    assessment: Assessment,
    data: AssessmentUpdate,
    db: Session
):
    if assessment.is_published:
        raise HTTPException(
            status_code=400,
            detail="Unpublish the assessment before editing"
        )

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(assessment, key, value)

    db.commit()
    db.refresh(assessment)

    return assessment


def delete_assessment(
    assessment: Assessment,
    db: Session
):
    if assessment.is_published:
        raise HTTPException(
            status_code=400,
            detail="Unpublish the assessment before deleting"
        )

    db.delete(assessment)
    db.commit()


def add_question(
    assessment: Assessment,
    data: QuestionCreate,
    db: Session
):
    if assessment.is_published:
        raise HTTPException(
            status_code=400,
            detail="Cannot add questions to a published assessment"
        )

    question = Question(
        assessment_id=assessment.id,
        question_text=data.question_text,
        option_a=data.option_a,
        option_b=data.option_b,
        option_c=data.option_c,
        option_d=data.option_d,
        correct_option=data.correct_option,
        marks=data.marks
    )

    db.add(question)

    assessment.total_marks = (
        assessment.total_marks + data.marks
    )

    db.commit()
    db.refresh(question)

    return question


def get_assessment_questions(
    assessment_id: int,
    db: Session
):
    return db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).all()


def publish_assessment(
    assessment: Assessment,
    db: Session
):
    if assessment.is_published:
        raise HTTPException(
            status_code=400,
            detail="Assessment is already published"
        )

    questions = get_assessment_questions(
        assessment.id,
        db
    )

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="Add at least one question before publishing"
        )

    assessment.total_marks = sum(
        question.marks for question in questions
    )

    assessment.is_published = True

    db.commit()
    db.refresh(assessment)

    return assessment


def unpublish_assessment(
    assessment: Assessment,
    db: Session
):
    assessment.is_published = False

    db.commit()
    db.refresh(assessment)

    return assessment