import smtplib

from email.message import EmailMessage

from app.config import settings


def send_email(
    recipient_email: str,
    subject: str,
    message: str
):
    try:
        email = EmailMessage()

        email["From"] = settings.SMTP_EMAIL
        email["To"] = recipient_email
        email["Subject"] = subject

        email.set_content(message)

        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT
        ) as server:

            server.starttls()

            server.login(
                settings.SMTP_EMAIL,
                settings.SMTP_PASSWORD
            )

            server.send_message(email)

        return True, None

    except Exception as error:
        return False, str(error)
