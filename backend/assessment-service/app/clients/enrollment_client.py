import httpx

from fastapi import HTTPException

from app.config import settings


def check_enrollment(course_id: int, token: str):
    try:
        response = httpx.get(
            f"{settings.ENROLLMENT_SERVICE_URL}/enrollments/my-courses",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )

        response.raise_for_status()

        enrollments = response.json()

        for enrollment in enrollments:
            if (
                enrollment["id"] == course_id
                and enrollment["enrollment_status"] == "ACTIVE"
            ):
                return True

        return False

    except httpx.HTTPStatusError:
        raise HTTPException(
            status_code=503,
            detail="Unable to verify student enrollment"
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Enrollment Service is unavailable"
        )