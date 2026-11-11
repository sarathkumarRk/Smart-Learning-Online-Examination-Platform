from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.enrollment import (
    EnrollmentCreate,
    EnrollmentResponse,
    EnrollmentStatusUpdate,
    MyCourseResponse
)

from app.dependencies import (
    get_current_user,
    student_required,
    admin_required
)

from app.services.enrollment_service import (
    enroll_student,
    get_my_enrollments,
    get_enrollment_by_id,
    update_enrollment_status,
    get_my_courses,
    get_all_enrollments
)


router = APIRouter(
    prefix="/enrollments",
    tags=["Enrollment Management"]
)


@router.post(
    "/",
    response_model=EnrollmentResponse
)
def create_enrollment(
    data: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(student_required),
):
    return enroll_student(
        data,
        current_user["id"],
        current_user.get("email"),
        db
    )


@router.get(
    "/my-courses",
    response_model=list[MyCourseResponse]
)
def my_courses(
    db: Session = Depends(get_db),
    current_user: dict = Depends(student_required),
):
    return get_my_courses(
        current_user["id"],
        db
    )


@router.get(
    "/",
    response_model=list[EnrollmentResponse]
)
def my_enrollments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(student_required),
):
    return get_my_enrollments(
        current_user["id"],
        db
    )


@router.get(
    "/all",
    response_model=list[EnrollmentResponse]
)
def all_enrollments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required),
):
    return get_all_enrollments(db)


@router.get(
    "/{enrollment_id}",
    response_model=EnrollmentResponse
)
def enrollment_details(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(student_required),
):
    return get_enrollment_by_id(
        enrollment_id,
        current_user["id"],
        db
    )


@router.patch(
    "/{enrollment_id}/status",
    response_model=EnrollmentResponse
)
def change_enrollment_status(
    enrollment_id: int,
    data: EnrollmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(student_required),
):
    return update_enrollment_status(
        enrollment_id,
        current_user["id"],
        data.status,
        db
    )