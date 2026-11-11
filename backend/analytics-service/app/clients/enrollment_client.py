import httpx

from fastapi import HTTPException

from app.config import settings


def get_all_enrollments(token: str):
    url = (
        f"{settings.ENROLLMENT_SERVICE_URL.rstrip('/')}"
        "/enrollments/all"
    )

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
                detail="Enrollment Service returned an invalid response"
            )

        return data

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Enrollment Service request timed out"
        )

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=error.response.status_code,
            detail={
                "service": "Enrollment Service",
                "message": error.response.text
            }
        )

    except httpx.RequestError as error:
        raise HTTPException(
            status_code=503,
            detail={
                "service": "Enrollment Service",
                "message": str(error)
            }
        )