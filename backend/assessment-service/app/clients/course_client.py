import httpx

from fastapi import HTTPException

from app.config import settings


def get_course(course_id: int, token: str):
    try:
        response = httpx.get(
            f"{settings.COURSE_SERVICE_URL}/courses/{course_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )

        if response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Course not found or not published"
            )

        response.raise_for_status()

        return response.json()

    except httpx.HTTPStatusError:
        raise HTTPException(
            status_code=503,
            detail="Course Service is unavailable"
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to Course Service"
        )