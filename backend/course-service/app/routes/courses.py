from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Course
from app.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse
)

from app.dependencies import (
    get_current_user,
    instructor_required,
    admin_required
)

from app.services.course_service import (
    create_course,
    get_published_courses,
    get_instructor_courses,
    get_all_courses,
    get_course_by_id,
    update_course,
    delete_course,
    publish_course,
    unpublish_course
)


router = APIRouter(
    prefix="/courses",
    tags=["Course Management"]
)


# Create Course
@router.post(
    "/",
    response_model=CourseResponse
)
def create_new_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(instructor_required),
):
    return create_course(
        data,
        current_user["id"],
        db
    )


# Get Published Courses
@router.get(
    "/",
    response_model=list[CourseResponse]
)
def get_courses(
    db: Session = Depends(get_db),
):
    return get_published_courses(db)


# Get Instructor Courses
@router.get(
    "/my-courses",
    response_model=list[CourseResponse]
)
def my_courses(
    db: Session = Depends(get_db),
    current_user: dict = Depends(instructor_required),
):
    return get_instructor_courses(
        current_user["id"],
        db
    )


# Admin Get All Courses
@router.get(
    "/all",
    response_model=list[CourseResponse]
)
def all_courses(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required),
):
    return get_all_courses(db)


# Get Course By ID
@router.get(
    "/{course_id}",
    response_model=CourseResponse
)
def course_details(
    course_id: int,
    db: Session = Depends(get_db),
):
    course = get_course_by_id(course_id, db)

    if not course.is_published:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


# Update Course
@router.put(
    "/{course_id}",
    response_model=CourseResponse
)
def update_existing_course(
    course_id: int,
    data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(instructor_required),
):
    return update_course(
        course_id,
        current_user["id"],
        data,
        db
    )


# Delete Course
@router.delete("/{course_id}")
def delete_existing_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(instructor_required),
):
    return delete_course(
        course_id,
        current_user["id"],
        db
    )


# Publish Course
@router.patch(
    "/{course_id}/publish",
    response_model=CourseResponse
)
def publish_existing_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(instructor_required),
):
    return publish_course(
        course_id,
        current_user["id"],
        db
    )


# Unpublish Course
@router.patch(
    "/{course_id}/unpublish",
    response_model=CourseResponse
)
def unpublish_existing_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(instructor_required),
):
    return unpublish_course(
        course_id,
        current_user["id"],
        db
    )
