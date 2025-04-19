from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = Field(..., pattern="^(administrator|manager|customer|support|delivery)$")
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = True



class UserUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    password: Optional[str]
    role: Optional[str] = Field(None, pattern="^(administrator|manager|customer|support|delivery)$")
    phone: Optional[str]
    address: Optional[str]
    is_active: Optional[bool]


class User(UserBase):
    id: int
    role: str
    is_active: bool

    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str  # you can also use Literal for role

class UserSchema(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        orm_mode = True

class LoginSchema(BaseModel):
    email: EmailStr
    password: str
    role: Literal["customer", "worker"]