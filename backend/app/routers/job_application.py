import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Response
from typing import Annotated, List
from app.dependencies import get_db
from sqlmodel import Session
from app.schemas.job_application import JobApplicationCreate, JobApplicationSchema, ScheduleRequest
from app.models.models import JobApplication, User
from fastapi.responses import FileResponse
from datetime import datetime
from app.utils.email import send_email, get_schedule_email, get_rejection_email, get_approval_email
from app.services.user_service import hash_password
from app.utils.passwords import generate_random_password
from app.utils.files import UPLOAD_DIR
from app.services.job_application_service import generate_unique_email, generate_user_credentials
from app.repositories import job_application_repository

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

@router.get("/{job_app_id}", response_model=JobApplicationSchema)
def get_job_application(job_app_id: int, db: Session = Depends(get_db)):
    job_app = job_application_repository.get_job_application_by_id(db, job_app_id)
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")
    return job_app

@router.get("/", response_model=List[JobApplicationSchema])
def get_all_job_applications(db: Session = Depends(get_db)):
    return job_application_repository.get_all_waiting_applications(db)

@router.post("/", response_model=JobApplicationSchema)
def create_job_application(job_app: JobApplicationCreate, db: Session = Depends(get_db)):
    job_app_db = JobApplication(**job_app.dict())
    return job_application_repository.create_job_application(db, job_app_db)

@router.post("/{job_app_id}/upload-cv", response_model=JobApplicationSchema)
async def upload_cv_file(job_app_id: int, cv_file: UploadFile = File(...), db: Session = Depends(get_db)):
    job_app = job_application_repository.get_job_application_by_id(db, job_app_id)
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")

    filename = f"{job_app_id}_{cv_file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(cv_file.file, buffer)

    job_app.cv_file = filename
    return job_application_repository.update_job_application(db, job_app)

@router.get("/{job_app_id}/download-cv")
def download_cv_file(job_app_id: int, db: Session = Depends(get_db)):
    job_app = job_application_repository.get_job_application_by_id(db, job_app_id)
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
    job_app = job_application_repository.get_job_application_by_id(db, job_app_id)
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")

    interview_dt = datetime.combine(schedule.date, schedule.time)
    job_app.status = "scheduled"
    job_app.interview_time = interview_dt
    job_application_repository.update_job_application(db, job_app)

    subject, body = get_schedule_email(job_app, interview_dt)

    try:
        send_email(job_app.email, subject, body)
        return {"message": "Interview scheduled and email sent."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")

@router.post("/{app_id}/reject")
def reject_application(app_id: int, db: Session = Depends(get_db)):
    app = job_application_repository.get_job_application_by_id(db, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    subject, body = get_rejection_email(app)

    try:
        send_email(app.email, subject, body)
        job_application_repository.delete_job_application(db, app)
        return {"message": "Application rejected, email sent and application removed."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")

@router.get("/interviews/upcoming", response_model=List[JobApplicationSchema])
def get_upcoming_interviews(db: Session = Depends(get_db)):
    return job_application_repository.get_upcoming_interviews(db)

@router.post("/{app_id}/approve")
def approve_application(app_id: int, db: Session = Depends(get_db)):
    app = job_application_repository.get_job_application_by_id(db, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    generated_email = generate_unique_email(app, db)
    generated_password, hashed_password = generate_user_credentials()

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

        subject, body = get_approval_email(app, generated_email, generated_password)

        send_email(app.email, subject, body)
        job_application_repository.delete_job_application(db, app)

        return {"message": "Application approved, account created, email sent and application removed."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
