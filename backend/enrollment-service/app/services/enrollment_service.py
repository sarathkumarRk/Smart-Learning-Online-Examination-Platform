from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models import Enrollment, EnrollmentStatus
from app.schemas.enrollment import EnrollmentCreate
from app.clients.course_client import get_course
from app.clients.notification_client import send_enrollment_notification


def enroll_student(
    data: EnrollmentCreate,
    student_id: int,
    student_email: str,
    db: Session,
):
    course = get_course(data.course_id)

    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == data.course_id
    ).first()

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course",
        )

    new_enrollment = Enrollment(
        student_id=student_id,
        course_id=data.course_id,
        status=EnrollmentStatus.ACTIVE
    )

    try:
        db.add(new_enrollment)
        db.commit()
        db.refresh(new_enrollment)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create enrollment"
        )

    if student_email:
        try:
            send_enrollment_notification(
                student_email,
                course["title"]
            )
        except Exception:
            pass

    return new_enrollment


def get_my_enrollments(
    student_id: int,
    db: Session,
):
    return db.query(Enrollment).filter(
        Enrollment.student_id == student_id
    ).order_by(
        Enrollment.id.desc()
    ).all()


def get_all_enrollments(
    db: Session,
):
    try:
        return db.query(Enrollment).order_by(
            Enrollment.id.desc()
        ).all()

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve enrollments"
        )


def get_enrollment_by_id(
    enrollment_id: int,
    student_id: int,
    db: Session,
):
    enrollment = db.query(Enrollment).filter(
        Enrollment.id == enrollment_id,
        Enrollment.student_id == student_id
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )

    return enrollment


def update_enrollment_status(
    enrollment_id: int,
    student_id: int,
    new_status: EnrollmentStatus,
    db: Session,
):
    enrollment = get_enrollment_by_id(
        enrollment_id,
        student_id,
        db
    )

    if new_status == EnrollmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only the system can mark enrollment as completed"
        )

    if enrollment.status == EnrollmentStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enrollment is already cancelled"
        )

    enrollment.status = new_status

    try:
        db.commit()
        db.refresh(enrollment)

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update enrollment status"
        )

    return enrollment


def get_my_courses(
    student_id: int,
    db: Session,
):
    enrollments = get_my_enrollments(student_id, db)

    enrolled_courses = []

    for enrollment in enrollments:
        try:
            course = get_course(enrollment.course_id)

            enrolled_courses.append({
                "id": course["id"],
                "title": course["title"],
                "description": course["description"],
                "category": course["category"],
                "duration": course["duration"],
                "is_published": course["is_published"],
                "enrollment_status": enrollment.status,
                "enrolled_at": enrollment.enrolled_at
            })

        except HTTPException:
            continue

    return enrolled_courses