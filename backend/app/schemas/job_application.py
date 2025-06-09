from typing import Optional
from pydantic import BaseModel, EmailStr


class JobApplicationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    role: str

class JobApplicationSchema(JobApplicationCreate):
    id: int

    class Config:
        orm_mode = True