import httpx

from fastapi import HTTPException

from app.config import settings


def make_request(url: str, token: str, service_name: str):
    try:
        response = httpx.get(
            url,
            headers={"Authorization": f"Bearer {token}"},
            timeout=15
        )

        response.raise_for_status()

        data = response.json()

        if not isinstance(data, list):
            raise HTTPException(
                status_code=502,
                detail=f"{service_name} returned an invalid response"
            )

        return data

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=f"{service_name} request timed out"
        )

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=error.response.status_code,
            detail={
                "service": service_name,
                "message": error.response.text
            }
        )

    except httpx.RequestError as error:
        raise HTTPException(
            status_code=503,
            detail={
                "service": service_name,
                "message": str(error)
            }
        )


def get_all_courses(token: str):
    url = (
        f"{settings.COURSE_SERVICE_URL.rstrip('/')}"
        "/courses/all"
    )

    return make_request(
        url,
        token,
        "Course Service"
    )


def get_course_assessments(course_id: int, token: str):
    url = (
        f"{settings.ASSESSMENT_SERVICE_URL.rstrip('/')}"
        f"/assessments/course/{course_id}"
    )

    return make_request(
        url,
        token,
        "Assessment Service"
    )