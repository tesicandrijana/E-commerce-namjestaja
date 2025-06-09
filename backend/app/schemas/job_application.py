from typing import Optional
from datetime import date, time, datetime
from pydantic import BaseModel, EmailStr


class JobApplicationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    role: str


class JobApplicationSchema(JobApplicationCreate):
    id: int
    status: str 
    interview_time: Optional[datetime] = None  

    class Config:
        orm_mode = True


class ScheduleRequest(BaseModel):
    date: date
    time: time
