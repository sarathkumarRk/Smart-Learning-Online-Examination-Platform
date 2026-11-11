import httpx

from fastapi import HTTPException

from app.config import settings


# Get Published Course
def get_course(course_id: int):

    url = f"{settings.COURSE_SERVICE_URL}/courses/{course_id}"

    try:
        response = httpx.get(
            url,
            timeout=10
        )

        if response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Course not found or not published"
            )

        response.raise_for_status()

        course = response.json()

        if not course.get("is_published"):
            raise HTTPException(
                status_code=400,
                detail="Course is not published"
            )

        return course

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=503,
            detail="Course Service is unavailable"
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Course Service"
        )
