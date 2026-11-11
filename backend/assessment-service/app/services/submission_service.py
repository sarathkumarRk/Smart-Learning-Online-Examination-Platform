from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Assessment, Question, Submission


def submit_assessment(
    assessment: Assessment,
    student_id: int,
    answers: dict,
    db: Session
):
    if not assessment.is_published:
        raise HTTPException(
            status_code=400,
            detail="Assessment is not published"
        )

    now = datetime.now(timezone.utc)

    if assessment.deadline:
        deadline = assessment.deadline

        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

        if now > deadline:
            raise HTTPException(
                status_code=400,
                detail="Assessment submission deadline has passed"
            )

    previous_submissions = db.query(Submission).filter(
        Submission.assessment_id == assessment.id,
        Submission.student_id == student_id
    ).all()

    if previous_submissions and not assessment.allow_retakes:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted this assessment"
        )

    questions = db.query(Question).filter(
        Question.assessment_id == assessment.id
    ).all()

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="No questions available"
        )

    question_ids = {question.id for question in questions}
    normalized_answers = {}

    for question_id, answer in answers.items():
        try:
            parsed_question_id = int(question_id)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail="Invalid question ID"
            )

        if parsed_question_id not in question_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Question {parsed_question_id} does not belong to this assessment"
            )

        if answer not in ["A", "B", "C", "D"]:
            raise HTTPException(
                status_code=400,
                detail="Answers must be A, B, C or D"
            )

        normalized_answers[parsed_question_id] = answer

    score = 0

    for question in questions:
        selected_answer = normalized_answers.get(question.id)

        if selected_answer == question.correct_option:
            score += question.marks

    submission = Submission(
        assessment_id=assessment.id,
        student_id=student_id,
        answers={
            str(question_id): answer
            for question_id, answer in normalized_answers.items()
        },
        score=score,
        total_marks=assessment.total_marks
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission


def get_student_submissions(
    student_id: int,
    db: Session
):
    return db.query(Submission).filter(
        Submission.student_id == student_id
    ).order_by(Submission.submitted_at.desc()).all()


def get_submission_by_id(
    submission_id: int,
    student_id: int,
    db: Session
):
    submission = db.query(Submission).filter(
        Submission.id == submission_id,
        Submission.student_id == student_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    return submission


def get_assessment_results(
    assessment_id: int,
    db: Session
):
    return db.query(Submission).filter(
        Submission.assessment_id == assessment_id
    ).order_by(Submission.submitted_at.desc()).all()


def get_all_submissions(db: Session):
    return db.query(Submission).order_by(
        Submission.submitted_at.desc()
    ).all()