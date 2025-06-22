import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Response
from typing import Annotated,List
from app.dependencies import get_db
from sqlmodel import Session
from app.schemas.job_application import JobApplicationCreate, JobApplicationSchema, ScheduleRequest
from app.models.models import JobApplication
from fastapi.responses import FileResponse
from datetime import datetime,timedelta

import smtplib
from email.mime.text import MIMEText
from app.models.models import User  



router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # kreira folder ako ne postoji

@router.get("/{job_app_id}", response_model=JobApplicationSchema)
def get_job_application(job_app_id: int, db: Session = Depends(get_db)):
    job_app = db.query(JobApplication).filter(JobApplication.id == job_app_id).first()
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")
    return job_app


@router.get("/", response_model=List[JobApplicationSchema])
def get_all_job_applications(db: Session = Depends(get_db)):
    applications = db.query(JobApplication).filter(JobApplication.status == 'waiting').all()
    return applications


@router.post("/", response_model=JobApplicationSchema)
def create_job_application(
    job_app: JobApplicationCreate,
    db: Session = Depends(get_db)
):
    job_app_db = JobApplication(**job_app.dict())
    db.add(job_app_db)
    db.commit()
    db.refresh(job_app_db)
    return job_app_db

@router.post("/{job_app_id}/upload-cv", response_model=JobApplicationSchema)
async def upload_cv_file(
    job_app_id: int,
    cv_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    job_app = db.query(JobApplication).filter(JobApplication.id == job_app_id).first()
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")

    filename = f"{job_app_id}_{cv_file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(cv_file.file, buffer)

    job_app.cv_file = filename
    db.commit()
    db.refresh(job_app)
    return job_app

@router.get("/{job_app_id}/download-cv")
def download_cv_file(job_app_id: int, db: Session = Depends(get_db)):
     # Pronađi aplikaciju
    job_app = db.query(JobApplication).filter(JobApplication.id == job_app_id).first()
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")

    # Provjeri da li postoji CV fajl u bazi
    if not job_app.cv_file:
        raise HTTPException(status_code=404, detail="No CV file associated with this application")

    # Pravi path do fajla
    file_path = os.path.join(UPLOAD_DIR, job_app.cv_file)

    # Provjeri da li fajl postoji na disku
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="CV file not found on server")

    # Vrati fajl kao download
    return FileResponse(
        path=file_path,
        filename=job_app.cv_file,
        media_type="application/pdf",  # možeš staviti i application/octet-stream za univerzalni download
    )

@router.post("/{job_app_id}/schedule")
def schedule_interview(job_app_id: int, schedule: ScheduleRequest, db: Session = Depends(get_db)):
    job_app = db.query(JobApplication).filter(JobApplication.id == job_app_id).first()
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")

    interview_dt = datetime.combine(schedule.date, schedule.time)

    job_app.status = "scheduled"
    job_app.interview_time = interview_dt
    db.add(job_app)
    db.commit()
    db.refresh(job_app)

    recipient_email = job_app.email
    subject = "Interview Scheduled"
    body = f"Dear {job_app.name},\n\nYour interview for the position of {job_app.role} has been scheduled on {interview_dt.strftime('%Y-%m-%d %H:%M')}.\n\nBest regards,\nFurni Style Team"

    sender_email = "furnystyle@gmail.com"  
    sender_password = "kxjz ozro eqib ipjm"           
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = recipient_email

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())

        return {"message": "Interview scheduled and email sent."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")
    
@router.post("/{app_id}/reject")
def reject_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    recipient_email = app.email
    subject = "Job Application Rejection"
    body = f"Dear {app.name},\n\nWe are sorry, but your job application for the position of {app.role} has been rejected. We hope you will have better luck next time.\n\nBest regards,\nFurni Style Team"

    sender_email = "furnystyle@gmail.com"  
    sender_password = "kxjz ozro eqib ipjm"           
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = recipient_email

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")
    
    db.delete(app)
    db.commit()
    
    return {"message": "Application rejected, email sent and application removed."}


@router.get("/interviews/upcoming", response_model=List[JobApplicationSchema])
def get_upcoming_interviews(db: Session = Depends(get_db)):
    interviews = (
        db.query(JobApplication)
        .filter(JobApplication.status == "scheduled")
        .order_by(JobApplication.interview_time)
        .all()
    )
    return interviews 


@router.post("/{app_id}/approve")
def approve_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = "accepted"
    db.add(app)

    try:
        db.commit()
        db.refresh(app)

        recipient_email = app.email
        subject = "Job Application Accepted"
        body = f"Dear {app.name},\n\nCongratulations! Your job application for the position of {app.role} has been accepted. We will contact you soon with the next steps.\n\nBest regards,\nFurni Style Team"

        sender_email = "furnystyle@gmail.com"  
        sender_password = "kxjz ozro eqib ipjm"           
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = recipient_email

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())

    except smtplib.SMTPException as smtp_err:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Email sending failed: {smtp_err}")

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

    return {"message": "Application approved, acceptance email sent and status updated."}
