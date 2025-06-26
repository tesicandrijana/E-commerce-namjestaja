import os
import random
import shutil
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Response
from typing import Annotated, List
from app.dependencies import get_db
from sqlmodel import Session
from app.schemas.job_application import JobApplicationCreate, JobApplicationSchema, ScheduleRequest
from app.models.models import JobApplication, User
from fastapi.responses import FileResponse
from datetime import datetime
from app.utils.email import send_email
from app.services.user_service import hash_password
from app.utils.passwords import generate_random_password

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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
def create_job_application(job_app: JobApplicationCreate, db: Session = Depends(get_db)):
    job_app_db = JobApplication(**job_app.dict())
    db.add(job_app_db)
    db.commit()
    db.refresh(job_app_db)
    return job_app_db


@router.post("/{job_app_id}/upload-cv", response_model=JobApplicationSchema)
async def upload_cv_file(job_app_id: int, cv_file: UploadFile = File(...), db: Session = Depends(get_db)):
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
    job_app = db.query(JobApplication).filter(JobApplication.id == job_app_id).first()
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")

    if not job_app.cv_file:
        raise HTTPException(status_code=404, detail="No CV file associated with this application")

    file_path = os.path.join(UPLOAD_DIR, job_app.cv_file)

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="CV file not found on server")

    return FileResponse(path=file_path, filename=job_app.cv_file, media_type="application/pdf")


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

    subject = "Interview Scheduled"
    body = (
        f"Dear {job_app.name},\n\n"
        f"Your interview for the position of {job_app.role} has been scheduled on "
        f"{interview_dt.strftime('%Y-%m-%d %H:%M')}.\n\n"
        f"Best regards,\nFurni Style Team"
    )

    try:
        send_email(job_app.email, subject, body)
        return {"message": "Interview scheduled and email sent."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")


@router.post("/{app_id}/reject")
def reject_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    subject = "Job Application Rejection"
    body = (
        f"Dear {app.name},\n\n"
        f"We are sorry, but your job application for the position of {app.role} has been rejected. "
        f"We hope you will have better luck next time.\n\n"
        f"Best regards,\nFurni Style Team"
    )

    try:
        send_email(app.email, subject, body)
        db.delete(app)
        db.commit()
        return {"message": "Application rejected, email sent and application removed."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")


@router.get("/interviews/upcoming", response_model=List[JobApplicationSchema])
def get_upcoming_interviews(db: Session = Depends(get_db)):
    return (
        db.query(JobApplication)
        .filter(JobApplication.status == "scheduled")
        .order_by(JobApplication.interview_time)
        .all()
    )


@router.post("/{app_id}/approve")
def approve_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    clean_name = app.name.lower().replace(" ", "")
    role_clean = app.role.lower().replace(" ", "")
    generated_email = f"{clean_name}@furnystyle.{role_clean}.com"

    if db.query(User).filter(User.email == generated_email).first():
        random_number = random.randint(1, 999)
        generated_email = f"{clean_name}{random_number}@furnystyle.{role_clean}.com"

        if db.query(User).filter(User.email == generated_email).first():
            raise HTTPException(status_code=400, detail="Generated email already exists, please resolve manually.")

    generated_password = generate_random_password()
    hashed_password = hash_password(generated_password)

    new_user = User(
        name=app.name,
        email=generated_email,
        password=hashed_password,
        role=app.role,
        phone=app.phone,
        address=app.address
    )
    db.add(new_user)

    try:
        db.commit()
        db.refresh(new_user)

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

        send_email(app.email, subject, body)
        db.delete(app)
        db.commit()

        return {"message": "Application approved, account created, email sent and application removed."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")