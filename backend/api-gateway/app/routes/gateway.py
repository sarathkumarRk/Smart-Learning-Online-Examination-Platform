from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, EmailStr, Field

from app.config import settings
from app.dependencies import (
    get_current_user,
    admin_required,
    instructor_required,
    student_required
)
from app.services.gateway_service import forward_request

router = APIRouter()


async def proxy(
    request: Request,
    service_url: str,
    path: str,
    json_body: dict | None = None
):
    return await forward_request(
        request=request,
        service_url=service_url,
        service_path=path,
        json_body=json_body
    )


# Request Schemas

class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=3)
    role: str = "STUDENT"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class CourseCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: Optional[str] = None
    category: str
    duration: int = Field(gt=0)


class CourseUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    duration: Optional[int] = Field(default=None, gt=0)


class EnrollmentCreateRequest(BaseModel):
    course_id: int = Field(gt=0)


class EnrollmentStatusUpdateRequest(BaseModel):
    status: str


class AssessmentCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: int = Field(gt=0)
    duration_minutes: int = Field(gt=0)
    total_marks: int = Field(gt=0)
    allow_retakes: bool = False
    deadline: Optional[datetime] = None


class AssessmentUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = Field(default=None, gt=0)
    total_marks: Optional[int] = Field(default=None, gt=0)
    allow_retakes: Optional[bool] = None
    deadline: Optional[datetime] = None


class QuestionCreateRequest(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str = Field(pattern="^[A-D]$")
    marks: int = Field(gt=0)


class SubmissionCreateRequest(BaseModel):
    answers: dict[int, str]


class NotificationCreateRequest(BaseModel):
    recipient_email: EmailStr
    subject: str
    message: str
    notification_type: str


class BulkNotificationCreateRequest(BaseModel):
    recipients: list[EmailStr]
    subject: str
    message: str
    notification_type: str

# Auth Service

@router.post(
    "/auth/register",
    tags=["Auth Service"],
    summary="Register User"
)
async def register_user(
    data: UserRegisterRequest,
    request: Request
):
    return await proxy(
        request,
        settings.AUTH_SERVICE_URL,
        "auth/register",
        data.model_dump(mode="json")
    )


@router.post(
    "/auth/login",
    tags=["Auth Service"],
    summary="Login User"
)
async def login_user(
    data: UserLoginRequest,
    request: Request
):
    return await proxy(
        request,
        settings.AUTH_SERVICE_URL,
        "auth/login",
        data.model_dump(mode="json")
    )


@router.get(
    "/users/me",
    tags=["Auth Service"],
    summary="Get Current User"
)
async def get_profile(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    return await proxy(
        request,
        settings.AUTH_SERVICE_URL,
        "users/me"
    )


@router.put(
    "/users/profile",
    tags=["Auth Service"],
    summary="Update User Profile"
)
async def update_profile(
    data: UserProfileUpdateRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    return await proxy(
        request,
        settings.AUTH_SERVICE_URL,
        "users/profile",
        data.model_dump(mode="json", exclude_unset=True)
    )


@router.get(
    "/users/",
    tags=["Auth Service"],
    summary="Get All Users"
)
async def get_all_users(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.AUTH_SERVICE_URL,
        "users/"
    )


@router.get(
    "/users/{user_id}",
    tags=["Auth Service"],
    summary="Get User By ID"
)
async def get_user(
    user_id: int,
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.AUTH_SERVICE_URL,
        f"users/{user_id}"
    )


# Course Service

@router.post(
    "/courses/",
    tags=["Course Service"],
    summary="Create Course"
)
async def create_course(
    data: CourseCreateRequest,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.COURSE_SERVICE_URL,
        "courses/",
        data.model_dump(mode="json")
    )


@router.get(
    "/courses/",
    tags=["Course Service"],
    summary="Get Published Courses"
)
async def get_courses(request: Request):
    return await proxy(
        request,
        settings.COURSE_SERVICE_URL,
        "courses/"
    )


@router.get(
    "/courses/my-courses",
    tags=["Course Service"],
    summary="Get My Courses"
)
async def get_my_courses(
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.COURSE_SERVICE_URL,
        "courses/my-courses"
    )


@router.get(
    "/courses/all",
    tags=["Course Service"],
    summary="Get All Courses"
)
async def get_all_courses(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.COURSE_SERVICE_URL,
        "courses/all"
    )


@router.get(
    "/courses/{course_id}",
    tags=["Course Service"],
    summary="Get Course By ID"
)
async def get_course(
    course_id: int,
    request: Request
):
    return await proxy(
        request,
        settings.COURSE_SERVICE_URL,
        f"courses/{course_id}"
    )


@router.put(
    "/courses/{course_id}",
    tags=["Course Service"],
    summary="Update Course"
)
async def update_course(
    course_id: int,
    data: CourseUpdateRequest,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.COURSE_SERVICE_URL,
        f"courses/{course_id}",
        data.model_dump(mode="json", exclude_unset=True)
    )


@router.delete(
    "/courses/{course_id}",
    tags=["Course Service"],
    summary="Delete Course"
)
async def delete_course(
    course_id: int,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.COURSE_SERVICE_URL,
        f"courses/{course_id}"
    )


@router.patch(
    "/courses/{course_id}/publish",
    tags=["Course Service"],
    summary="Publish Course"
)
async def publish_course(
    course_id: int,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.COURSE_SERVICE_URL,
        f"courses/{course_id}/publish"
    )


@router.patch(
    "/courses/{course_id}/unpublish",
    tags=["Course Service"],
    summary="Unpublish Course"
)
async def unpublish_course(
    course_id: int,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.COURSE_SERVICE_URL,
        f"courses/{course_id}/unpublish"
    )


# Enrollment Service

@router.post(
    "/enrollments/",
    tags=["Enrollment Service"],
    summary="Enroll In Course"
)
async def enroll_course(
    data: EnrollmentCreateRequest,
    request: Request,
    student: dict = Depends(student_required)
):
    return await proxy(
        request,
        settings.ENROLLMENT_SERVICE_URL,
        "enrollments/",
        data.model_dump(mode="json")
    )


@router.get(
    "/enrollments/my-courses",
    tags=["Enrollment Service"],
    summary="Get My Enrolled Courses"
)
async def get_my_enrolled_courses(
    request: Request,
    student: dict = Depends(student_required)
):
    return await proxy(
        request,
        settings.ENROLLMENT_SERVICE_URL,
        "enrollments/my-courses"
    )


@router.get(
    "/enrollments/all",
    tags=["Enrollment Service"],
    summary="Get All Enrollments"
)
async def get_all_enrollments(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.ENROLLMENT_SERVICE_URL,
        "enrollments/all"
    )


@router.get(
    "/enrollments/",
    tags=["Enrollment Service"],
    summary="Get Enrollments"
)
async def get_enrollments(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.ENROLLMENT_SERVICE_URL,
        "enrollments/"
    )


@router.get(
    "/enrollments/{enrollment_id}",
    tags=["Enrollment Service"],
    summary="Get Enrollment By ID"
)
async def get_enrollment(
    enrollment_id: int,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    return await proxy(
        request,
        settings.ENROLLMENT_SERVICE_URL,
        f"enrollments/{enrollment_id}"
    )


@router.patch(
    "/enrollments/{enrollment_id}/status",
    tags=["Enrollment Service"],
    summary="Update Enrollment Status"
)
async def update_enrollment_status(
    enrollment_id: int,
    data: EnrollmentStatusUpdateRequest,
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.ENROLLMENT_SERVICE_URL,
        f"enrollments/{enrollment_id}/status",
        data.model_dump(mode="json")
    )


# Assessment Service

@router.post(
    "/assessments/",
    tags=["Assessment Service"],
    summary="Create Assessment"
)
async def create_assessment(
    data: AssessmentCreateRequest,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        "assessments/",
        data.model_dump(mode="json")
    )


@router.get(
    "/assessments/my-assessments",
    tags=["Assessment Service"],
    summary="Get My Assessments"
)
async def get_my_assessments(
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        "assessments/my-assessments"
    )


@router.get(
    "/assessments/course/{course_id}",
    tags=["Assessment Service"],
    summary="Get Course Assessments"
)
async def get_course_assessments(
    course_id: int,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"assessments/course/{course_id}"
    )


@router.get(
    "/assessments/{assessment_id}",
    tags=["Assessment Service"],
    summary="Get Assessment By ID"
)
async def get_assessment(
    assessment_id: int,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"assessments/{assessment_id}"
    )


@router.put(
    "/assessments/{assessment_id}",
    tags=["Assessment Service"],
    summary="Update Assessment"
)
async def update_assessment(
    assessment_id: int,
    data: AssessmentUpdateRequest,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"assessments/{assessment_id}",
        data.model_dump(mode="json", exclude_unset=True)
    )


@router.delete(
    "/assessments/{assessment_id}",
    tags=["Assessment Service"],
    summary="Delete Assessment"
)
async def delete_assessment(
    assessment_id: int,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"assessments/{assessment_id}"
    )


@router.post(
    "/assessments/{assessment_id}/questions",
    tags=["Assessment Service"],
    summary="Add Question"
)
async def add_question(
    assessment_id: int,
    data: QuestionCreateRequest,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"assessments/{assessment_id}/questions",
        data.model_dump(mode="json")
    )


@router.get(
    "/assessments/{assessment_id}/questions",
    tags=["Assessment Service"],
    summary="Get Assessment Questions"
)
async def get_questions(
    assessment_id: int,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"assessments/{assessment_id}/questions"
    )


@router.patch(
    "/assessments/{assessment_id}/publish",
    tags=["Assessment Service"],
    summary="Publish Assessment"
)
async def publish_assessment(
    assessment_id: int,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"assessments/{assessment_id}/publish"
    )


@router.patch(
    "/assessments/{assessment_id}/unpublish",
    tags=["Assessment Service"],
    summary="Unpublish Assessment"
)
async def unpublish_assessment(
    assessment_id: int,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"assessments/{assessment_id}/unpublish"
    )


# Submission Service

@router.post(
    "/submissions/{assessment_id}",
    tags=["Submission Service"],
    summary="Submit Assessment"
)
async def submit_assessment(
    assessment_id: int,
    data: SubmissionCreateRequest,
    request: Request,
    student: dict = Depends(student_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"submissions/{assessment_id}",
        data.model_dump(mode="json")
    )


@router.get(
    "/submissions/my-results",
    tags=["Submission Service"],
    summary="Get My Results"
)
async def get_my_results(
    request: Request,
    student: dict = Depends(student_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        "submissions/my-results"
    )


@router.get(
    "/submissions/result/{submission_id}",
    tags=["Submission Service"],
    summary="Get Submission Result"
)
async def get_submission_result(
    submission_id: int,
    request: Request,
    student: dict = Depends(student_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"submissions/result/{submission_id}"
    )


@router.get(
    "/submissions/assessment/{assessment_id}/results",
    tags=["Submission Service"],
    summary="Get Assessment Results"
)
async def get_assessment_results(
    assessment_id: int,
    request: Request,
    instructor: dict = Depends(instructor_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        f"submissions/assessment/{assessment_id}/results"
    )


@router.get(
    "/submissions/all-results",
    tags=["Submission Service"],
    summary="Get All Submission Results"
)
async def get_all_submission_results(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.ASSESSMENT_SERVICE_URL,
        "submissions/all-results"
    )


# Notification Service

@router.post(
    "/notifications/send",
    tags=["Notification Service"],
    summary="Send Notification"
)
async def send_notification(
    data: NotificationCreateRequest,
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.NOTIFICATION_SERVICE_URL,
        "notifications/send",
        data.model_dump(mode="json")
    )


@router.post(
    "/notifications/send-bulk",
    tags=["Notification Service"],
    summary="Send Bulk Notifications"
)
async def send_bulk_notifications(
    data: BulkNotificationCreateRequest,
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.NOTIFICATION_SERVICE_URL,
        "notifications/send-bulk",
        data.model_dump(mode="json")
    )


@router.get(
    "/notifications/",
    tags=["Notification Service"],
    summary="Get Notifications"
)
async def get_notifications(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.NOTIFICATION_SERVICE_URL,
        "notifications/"
    )


@router.get(
    "/notifications/{notification_id}",
    tags=["Notification Service"],
    summary="Get Notification By ID"
)
async def get_notification(
    notification_id: int,
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.NOTIFICATION_SERVICE_URL,
        f"notifications/{notification_id}"
    )


# Analytics Service

@router.get(
    "/analytics/dashboard",
    tags=["Analytics Service"],
    summary="Get Dashboard Analytics"
)
async def get_dashboard_analytics(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.ANALYTICS_SERVICE_URL,
        "analytics/dashboard"
    )


@router.get(
    "/analytics/courses",
    tags=["Analytics Service"],
    summary="Get Course Analytics"
)
async def get_course_analytics(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.ANALYTICS_SERVICE_URL,
        "analytics/courses"
    )


@router.get(
    "/analytics/assessments",
    tags=["Analytics Service"],
    summary="Get Assessment Analytics"
)
async def get_assessment_analytics(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.ANALYTICS_SERVICE_URL,
        "analytics/assessments"
    )


@router.get(
    "/analytics/top-students",
    tags=["Analytics Service"],
    summary="Get Top Students"
)
async def get_top_students(
    request: Request,
    admin: dict = Depends(admin_required)
):
    return await proxy(
        request,
        settings.ANALYTICS_SERVICE_URL,
        "analytics/top-students"
    )