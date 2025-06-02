from sqlalchemy.orm import Session
from app.models.models import JobApplication
from app.schemas import JobApplicationCreate

def create_job_application(db: Session, job_app: JobApplicationCreate):
    db_app = JobApplication(**job_app.dict())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def get_job_application_by_id(db: Session, application_id: int):
    return db.query(JobApplication).filter(JobApplication.id == application_id).first()

def delete_job_application(db: Session, application_id: int):
    app = get_job_application_by_id(db, application_id)
    if app:
        db.delete(app)
        db.commit()
