from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Course
from app.schemas.course import CourseCreate, CourseUpdate


# Create Course
def create_course(
    data: CourseCreate,
    instructor_id: int,
    db: Session,
):
    new_course = Course(
        title=data.title,
        description=data.description,
        category=data.category,
        duration=data.duration,
        instructor_id=instructor_id,
        is_published=False,
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


# Get Published Courses
def get_published_courses(db: Session):
    return db.query(Course).filter(
        Course.is_published == True
    ).order_by(Course.id.desc()).all()


# Get Instructor Courses
def get_instructor_courses(
    instructor_id: int,
    db: Session,
):
    return db.query(Course).filter(
        Course.instructor_id == instructor_id
    ).order_by(Course.id.desc()).all()


# Get All Courses
def get_all_courses(db: Session):
    return db.query(Course).order_by(
        Course.id.desc()
    ).all()


# Get Course By ID
def get_course_by_id(
    course_id: int,
    db: Session,
):
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    return course


# Check Instructor Ownership
def check_course_owner(
    course_id: int,
    instructor_id: int,
    db: Session,
):
    course = get_course_by_id(course_id, db)

    if course.instructor_id != instructor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot manage this course",
        )

    return course


# Update Course
def update_course(
    course_id: int,
    instructor_id: int,
    data: CourseUpdate,
    db: Session,
):
    course = check_course_owner(
        course_id,
        instructor_id,
        db
    )

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(course, key, value)

    if course.duration <= 0:
        raise HTTPException(
            status_code=400,
            detail="Duration must be greater than zero",
        )

    db.commit()
    db.refresh(course)

    return course


# Delete Course
def delete_course(
    course_id: int,
    instructor_id: int,
    db: Session,
):
    course = check_course_owner(
        course_id,
        instructor_id,
        db
    )

    db.delete(course)
    db.commit()

    return {
        "message": "Course deleted successfully"
    }


# Publish Course
def publish_course(
    course_id: int,
    instructor_id: int,
    db: Session,
):
    course = check_course_owner(
        course_id,
        instructor_id,
        db
    )

    course.is_published = True

    db.commit()
    db.refresh(course)

    return course


# Unpublish Course
def unpublish_course(
    course_id: int,
    instructor_id: int,
    db: Session,
):
    course = check_course_owner(
        course_id,
        instructor_id,
        db
    )

    course.is_published = False

    db.commit()
    db.refresh(course)

    return course
