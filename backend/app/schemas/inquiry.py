from pydantic import BaseModel
from datetime import datetime
from typing import Optional

#korisnik salje
class UserInquiryCreate(BaseModel):
    name: str
    email: str
    message: str

#zaposlenik prima
class UserInquiryRead(UserInquiryCreate):
    id: int
    created_at: datetime
    response: Optional[str]
    responded_at: Optional[datetime]


    class Config:
        orm_mode = True

class InquiryResponse(BaseModel):
    response: str