from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class WorkerRequest(Base):
    __tablename__ = "worker_requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    status = Column(String, default="pending")
