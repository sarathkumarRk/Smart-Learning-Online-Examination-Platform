from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Assessment

from app.dependencies import (
    get_current_user,
    instructor_required
)

from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse
)

from app.schemas.question import (
    QuestionCreate,
    QuestionResponse
)

from app.services.assessment_service import (
    create_assessment,
    get_instructor_assessments,
    get_published_assessments,
    get_assessment_by_id,
    check_assessment_owner,
    update_assessment,
    delete_assessment,
    add_question,
    get_assessment_questions,
    publish_assessment,
    unpublish_assessment
)

from app.clients.course_client import get_course
from app.clients.enrollment_client import check_enrollment


router = APIRouter(
    prefix="/assessments",
    tags=["Assessments"]
)


@router.post("/", response_model=AssessmentResponse)
def create_new_assessment(
    data: AssessmentCreate,
    request: Request,
    user: dict = Depends(instructor_required),
    db: Session = Depends(get_db)
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    course = get_course(data.course_id, token)

    if course.get("instructor_id") != user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can create assessments only for your own courses"
        )

    return create_assessment(
        data,
        user["id"],
        db
    )


@router.get(
    "/my-assessments",
    response_model=list[AssessmentResponse]
)
def my_assessments(
    user: dict = Depends(instructor_required),
    db: Session = Depends(get_db)
):
    return get_instructor_assessments(
        user["id"],
        db
    )


@router.get(
    "/course/{course_id}",
    response_model=list[AssessmentResponse]
)
def course_assessments(
    course_id: int,
    request: Request,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] == "STUDENT":
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not check_enrollment(course_id, token):
            raise HTTPException(
                status_code=403,
                detail="You must enroll in this course to view assessments"
            )

        return get_published_assessments(
            course_id,
            db
        )

    if user["role"] == "INSTRUCTOR":
        return db.query(Assessment).filter(
            Assessment.course_id == course_id,
            Assessment.instructor_id == user["id"]
        ).all()

    if user["role"] == "ADMIN":
        return get_published_assessments(
            course_id,
            db
        )

    raise HTTPException(
        status_code=403,
        detail="Access denied"
    )


@router.get(
    "/{assessment_id}",
    response_model=AssessmentResponse
)
def assessment_details(
    assessment_id: int,
    request: Request,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = get_assessment_by_id(
        assessment_id,
        db
    )

    if user["role"] == "STUDENT":
        if not assessment.is_published:
            raise HTTPException(
                status_code=404,
                detail="Assessment not found"
            )

        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not check_enrollment(assessment.course_id, token):
            raise HTTPException(
                status_code=403,
                detail="You are not enrolled in this course"
            )

    elif user["role"] == "INSTRUCTOR":
        check_assessment_owner(
            assessment,
            user["id"]
        )

    elif user["role"] != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return assessment


@router.put(
    "/{assessment_id}",
    response_model=AssessmentResponse
)
def edit_assessment(
    assessment_id: int,
    data: AssessmentUpdate,
    user: dict = Depends(instructor_required),
    db: Session = Depends(get_db)
):
    assessment = get_assessment_by_id(
        assessment_id,
        db
    )

    check_assessment_owner(
        assessment,
        user["id"]
    )

    return update_assessment(
        assessment,
        data,
        db
    )


@router.delete("/{assessment_id}")
def remove_assessment(
    assessment_id: int,
    user: dict = Depends(instructor_required),
    db: Session = Depends(get_db)
):
    assessment = get_assessment_by_id(
        assessment_id,
        db
    )

    check_assessment_owner(
        assessment,
        user["id"]
    )

    delete_assessment(
        assessment,
        db
    )

    return {
        "message": "Assessment deleted successfully"
    }


@router.post(
    "/{assessment_id}/questions",
    response_model=QuestionResponse
)
def create_question(
    assessment_id: int,
    data: QuestionCreate,
    user: dict = Depends(instructor_required),
    db: Session = Depends(get_db)
):
    assessment = get_assessment_by_id(
        assessment_id,
        db
    )

    check_assessment_owner(
        assessment,
        user["id"]
    )

    return add_question(
        assessment,
        data,
        db
    )


@router.get(
    "/{assessment_id}/questions",
    response_model=list[QuestionResponse]
)
def list_questions(
    assessment_id: int,
    request: Request,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = get_assessment_by_id(
        assessment_id,
        db
    )

    if user["role"] == "STUDENT":
        if not assessment.is_published:
            raise HTTPException(
                status_code=404,
                detail="Assessment not found"
            )

        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not check_enrollment(assessment.course_id, token):
            raise HTTPException(
                status_code=403,
                detail="You are not enrolled in this course"
            )

    elif user["role"] == "INSTRUCTOR":
        check_assessment_owner(
            assessment,
            user["id"]
        )

    elif user["role"] != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return get_assessment_questions(
        assessment_id,
        db
    )


@router.patch(
    "/{assessment_id}/publish",
    response_model=AssessmentResponse
)
def publish(
    assessment_id: int,
    user: dict = Depends(instructor_required),
    db: Session = Depends(get_db)
):
    assessment = get_assessment_by_id(
        assessment_id,
        db
    )

    check_assessment_owner(
        assessment,
        user["id"]
    )

    return publish_assessment(
        assessment,
        db
    )


@router.patch(
    "/{assessment_id}/unpublish",
    response_model=AssessmentResponse
)
def unpublish(
    assessment_id: int,
    user: dict = Depends(instructor_required),
    db: Session = Depends(get_db)
):
    assessment = get_assessment_by_id(
        assessment_id,
        db
    )

    check_assessment_owner(
        assessment,
        user["id"]
    )

    return unpublish_assessment(
        assessment,
        db
    )
