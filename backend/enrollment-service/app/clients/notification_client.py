import httpx

from app.config import settings


# Send Enrollment Notification
def send_enrollment_notification(
    email: str,
    course_title: str
):

    url = f"{settings.NOTIFICATION_SERVICE_URL}/notifications/send"

    data = {
        "recipient_email": email,
        "subject": "Course Enrollment Confirmation",
        "message": f"You have successfully enrolled in {course_title}.",
        "notification_type": "ENROLLMENT"
    }

    try:
        response = httpx.post(
            url,
            json=data,
            timeout=10
        )

        response.raise_for_status()

        return response.json()

    except httpx.HTTPError:
        print("Enrollment notification failed")

        return None
