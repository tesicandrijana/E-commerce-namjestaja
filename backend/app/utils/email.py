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

def get_schedule_email(app, interview_dt):
    subject = "Interview Scheduled"
    body = (
        f"Dear {app.name},\n\n"
        f"Your interview for the position of {app.role} has been scheduled on "
        f"{interview_dt.strftime('%Y-%m-%d %H:%M')}.\n\n"
        f"Best regards,\nFurni Style Team"
    )
    return subject, body

def get_rejection_email(app):
    subject = "Job Application Rejection"
    body = (
        f"Dear {app.name},\n\n"
        f"We are sorry, but your job application for the position of {app.role} has been rejected. "
        f"We hope you will have better luck next time.\n\n"
        f"Best regards,\nFurni Style Team"
    )
    return subject, body

def get_approval_email(app, generated_email, generated_password):
    subject = "Job Application Accepted - Account Created"
    body = (
        f"Dear {app.name},\n\n"
        f"Congratulations! Your application for the position of {app.role} has been accepted.\n"
        f"An account has been created for you with the following credentials:\n\n"
        f"Email: {generated_email}\n"
        f"Password: {generated_password}\n\n"
        f"Please log in and change your password as soon as possible.\n\n"
        f"Best regards,\nFurni Style Team"
    )
    return subject, body

def status_change_email(customer, status: str):
    subject = "Order Status Update"
    body = (
        f"Dear {customer.name}, \n\n"
        f"Your order status has been updated to: {status}.\n\n"
        f"If you have any questions, feel free to contact us.\n\n"
        f"Best regards,\nFurni Style Team"
    )

    send_email(to=customer.email, subject=subject, body=body)