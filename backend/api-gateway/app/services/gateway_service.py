import logging

import httpx

from fastapi import HTTPException, Request, Response


logger = logging.getLogger(__name__)


async def forward_request(
    request: Request,
    service_url: str,
    service_path: str,
    json_body: dict | None = None
):
    url = f"{service_url.rstrip('/')}/{service_path.lstrip('/')}"

    excluded_request_headers = {
        "host",
        "content-length",
        "content-encoding",
        "connection"
    }

    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in excluded_request_headers
    }

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(
                connect=10.0,
                read=90.0,
                write=30.0,
                pool=10.0
            ),
            follow_redirects=True
        ) as client:

            if json_body is not None:
                response = await client.request(
                    method=request.method,
                    url=url,
                    params=request.query_params,
                    headers=headers,
                    json=json_body
                )

            else:
                request_body = None

                if request.method not in ["GET", "HEAD"]:
                    request_body = await request.body()

                response = await client.request(
                    method=request.method,
                    url=url,
                    params=request.query_params,
                    headers=headers,
                    content=request_body
                )

        excluded_response_headers = {
            "content-length",
            "content-encoding",
            "transfer-encoding",
            "connection"
        }

        response_headers = {
            key: value
            for key, value in response.headers.items()
            if key.lower() not in excluded_response_headers
        }

        logger.info(
            "Gateway request completed. Method: %s URL: %s Status: %s",
            request.method,
            url,
            response.status_code
        )

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers
        )

    except httpx.ConnectTimeout as error:
        logger.exception(
            "Microservice connection timeout. URL: %s Error: %s",
            url,
            str(error)
        )

        raise HTTPException(
            status_code=504,
            detail=f"Could not connect to microservice: {url}"
        )

    except httpx.ReadTimeout as error:
        logger.exception(
            "Microservice response timeout. URL: %s Error: %s",
            url,
            str(error)
        )

        raise HTTPException(
            status_code=504,
            detail=f"Microservice response timed out: {url}"
        )

    except httpx.TimeoutException as error:
        logger.exception(
            "Microservice timeout. URL: %s Error: %s",
            url,
            str(error)
        )

        raise HTTPException(
            status_code=504,
            detail=f"Microservice request timed out: {url}"
        )

    except httpx.RequestError as error:
        logger.exception(
            "Microservice connection failed. URL: %s Error: %s",
            url,
            str(error)
        )

        raise HTTPException(
            status_code=503,
            detail={
                "message": "Microservice is currently unavailable",
                "service_url": url,
                "error": str(error)
            }
        )