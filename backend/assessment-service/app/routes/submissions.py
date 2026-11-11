from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import (
    student_required,
    instructor_required,
    admin_required
)

from app.schemas.submission import (
    SubmissionCreate,
    SubmissionResponse
)

from app.services.assessment_service import (
    get_assessment_by_id
)

from app.services.submission_service import (
    submit_assessment,
    get_student_submissions,
    get_submission_by_id,
    get_assessment_results,
    get_all_submissions
)

from app.clients.enrollment_client import check_enrollment


router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"]
)


@router.post(
    "/{assessment_id}",
    response_model=SubmissionResponse
)
def submit_answers(
    assessment_id: int,
    data: SubmissionCreate,
    request: Request,
    user: dict = Depends(student_required),
    db: Session = Depends(get_db)
):
    assessment = get_assessment_by_id(
        assessment_id,
        db
    )

    token = request.headers.get(
        "Authorization", ""
    ).replace("Bearer ", "")

    is_enrolled = check_enrollment(
        assessment.course_id,
        token
    )

    if not is_enrolled:
        raise HTTPException(
            status_code=403,
            detail="You must be enrolled in this course to submit the assessment"
        )

    return submit_assessment(
        assessment,
        user["id"],
        data.answers,
        db
    )


@router.get(
    "/my-results",
    response_model=list[SubmissionResponse]
)
def my_results(
    user: dict = Depends(student_required),
    db: Session = Depends(get_db)
):
    return get_student_submissions(
        user["id"],
        db
    )


@router.get(
    "/result/{submission_id}",
    response_model=SubmissionResponse
)
def result_details(
    submission_id: int,
    user: dict = Depends(student_required),
    db: Session = Depends(get_db)
):
    return get_submission_by_id(
        submission_id,
        user["id"],
        db
    )


@router.get(
    "/assessment/{assessment_id}/results",
    response_model=list[SubmissionResponse]
)
def instructor_results(
    assessment_id: int,
    user: dict = Depends(instructor_required),
    db: Session = Depends(get_db)
):
    assessment = get_assessment_by_id(
        assessment_id,
        db
    )

    if assessment.instructor_id != user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You cannot view results for this assessment"
        )

    return get_assessment_results(
        assessment_id,
        db
    )


@router.get(
    "/all-results",
    response_model=list[SubmissionResponse]
)
def all_results(
    user: dict = Depends(admin_required),
    db: Session = Depends(get_db)
):
    return get_all_submissions(db)