from sqlalchemy.orm import Session
from app.models.models import JobApplication

def get_job_application_by_id(db: Session, job_app_id: int):
    return db.query(JobApplication).filter(JobApplication.id == job_app_id).first()

def get_all_waiting_applications(db: Session):
    return db.query(JobApplication).filter(JobApplication.status == 'waiting').all()

def create_job_application(db: Session, job_app: JobApplication):
    db.add(job_app)
    db.commit()
    db.refresh(job_app)
    return job_app

def update_job_application(db: Session, job_app: JobApplication):
    db.add(job_app)
    db.commit()
    db.refresh(job_app)
    return job_app

def delete_job_application(db: Session, job_app: JobApplication):
    db.delete(job_app)
    db.commit()

def get_upcoming_interviews(db: Session):
    return (
        db.query(JobApplication)
        .filter(JobApplication.status == "scheduled")
        .order_by(JobApplication.interview_time)
        .all()
    )
