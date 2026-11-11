import httpx

from fastapi import HTTPException

from app.config import settings


def get_all_users(token: str):
    url = f"{settings.AUTH_SERVICE_URL.rstrip('/')}/users/"

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
                detail="Auth Service returned an invalid users response"
            )

        return data

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Auth Service request timed out"
        )

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=error.response.status_code,
            detail={
                "service": "Auth Service",
                "message": error.response.text
            }
        )

    except httpx.RequestError as error:
        raise HTTPException(
            status_code=503,
            detail={
                "service": "Auth Service",
                "message": str(error)
            }
        )