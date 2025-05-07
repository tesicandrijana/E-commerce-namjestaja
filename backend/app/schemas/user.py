from pydantic import BaseModel, EmailStr
from typing import Literal, Optional
from datetime import datetime

ValidRoles = Literal["administrator", "manager", "customer", "support", "delivery"]

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[ValidRoles] = "customer"  # Default to "customer"
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    password: Optional[str]
    role: Optional[ValidRoles]
    phone: Optional[str]
    address: Optional[str]
    is_active: Optional[bool]

class User(UserBase):
    id: int
    role: ValidRoles
    is_active: bool

class UserSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: ValidRoles

class LoginWithRole(BaseModel):
    email: EmailStr
    password: str
    role: Literal["customer", "worker"]  # This is used for checking the login role

WorkerRole = Literal["manager", "support", "delivery"]
RequestStatus = Literal["pending", "approved", "rejected"]

class WorkerRequestCreate(BaseModel):
    desired_role: WorkerRole

class WorkerRequestRead(BaseModel):
    id: int
    user_id: int
    desired_role: WorkerRole
    status: RequestStatus
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None