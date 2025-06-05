from pydantic import BaseModel
from datetime import datetime

#korisnik salje
class UserInquiryCreate(BaseModel):
    name: str
    email: str
    message: str

#zaposlenik prima
class UserInquiryRead(UserInquiryCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class InquiryResponse(BaseModel):
    response: str