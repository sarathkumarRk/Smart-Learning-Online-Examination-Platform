import logging

import httpx
from fastapi import HTTPException

from app.config import settings

logger = logging.getLogger(__name__)


def get_all_submissions(token: str):
    url = (
        f"{settings.ASSESSMENT_SERVICE_URL.rstrip('/')}"
        "/submissions/all-results"
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        logger.info("Requesting Assessment Service: %s", url)

        response = httpx.get(
            url,
            headers=headers,
            timeout=httpx.Timeout(
                connect=5.0,
                read=30.0,
                write=10.0,
                pool=5.0
            )
        )

        logger.info(
            "Assessment Service responded with status: %s",
            response.status_code
        )

        response.raise_for_status()

        data = response.json()

        if not isinstance(data, list):
            logger.error("Assessment Service returned a non-list response")
            raise HTTPException(
                status_code=502,
                detail="Assessment Service returned an invalid submissions response"
            )

        return data

    except httpx.TimeoutException:
        logger.exception("Assessment Service request timed out")
        raise HTTPException(
            status_code=504,
            detail="Assessment Service request timed out"
        )

    except httpx.HTTPStatusError as error:
        logger.error(
            "Assessment Service error: %s",
            error.response.text
        )
        raise HTTPException(
            status_code=error.response.status_code,
            detail={
                "service": "Assessment Service",
                "message": error.response.text
            }
        )

    except httpx.RequestError as error:
        logger.exception("Assessment Service connection failed")
        raise HTTPException(
            status_code=503,
            detail={
                "service": "Assessment Service",
                "message": str(error)
            }
        )

    except ValueError:
        logger.exception("Assessment Service returned invalid JSON")
        raise HTTPException(
            status_code=502,
            detail="Assessment Service returned invalid JSON"
        )