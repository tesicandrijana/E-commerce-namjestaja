import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Response
from typing import Annotated,List
from app.dependencies import get_db
from sqlmodel import Session
from app.schemas.job_application import JobApplicationCreate, JobApplicationSchema
from app.models.models import JobApplication


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
    applications = db.query(JobApplication).all()
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
    job_app = db.query(JobApplication).filter(JobApplication.id == job_app_id).first()
    if not job_app or not job_app.cv_file:
        raise HTTPException(status_code=404, detail="CV file not found")

    file_path = os.path.join(UPLOAD_DIR, job_app.cv_file)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=file_path,
        filename=job_app.cv_file,
        media_type="application/pdf"  
    )