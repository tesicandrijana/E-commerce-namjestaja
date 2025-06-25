import smtplib
from email.message import EmailMessage
from app.core.config import settings

def send_email(to: str, subject: str, body: str):
    msg = EmailMessage()
    msg["From"] = settings.EMAIL_SENDER
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
            smtp.send_message(msg)
    except Exception as e:
        raise RuntimeError(f"Error with sending an email: {str(e)}")
