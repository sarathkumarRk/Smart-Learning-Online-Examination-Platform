from fastapi import APIRouter, Depends, HTTPException, Request

from app.dependencies import admin_required

from app.services.analytics_service import (
    get_dashboard_analytics,
    get_course_statistics,
    get_assessment_statistics,
    get_top_students
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


def get_token(request: Request) -> str:
    authorization = request.headers.get("Authorization", "")

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header"
        )

    token = authorization[7:].strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Access token is missing"
        )

    return token


@router.get("/dashboard")
def dashboard_analytics(
    request: Request,
    user: dict = Depends(admin_required)
):
    token = get_token(request)

    return get_dashboard_analytics(token)


@router.get("/courses")
def course_analytics(
    request: Request,
    user: dict = Depends(admin_required)
):
    token = get_token(request)

    return get_course_statistics(token)


@router.get("/assessments")
def assessment_analytics(
    request: Request,
    user: dict = Depends(admin_required)
):
    token = get_token(request)

    return get_assessment_statistics(token)


@router.get("/top-students")
def top_students(
    request: Request,
    user: dict = Depends(admin_required)
):
    token = get_token(request)

    return get_top_students(token)