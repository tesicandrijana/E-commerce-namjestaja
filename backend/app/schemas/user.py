from typing import Optional, Literal
from sqlmodel import SQLModel, Field
from pydantic import EmailStr

ValidRoles = Literal["admin", "manager", "customer", "support", "delivery"]

class UserBase(SQLModel):
    name: str
    email: EmailStr
    role: Optional[ValidRoles] = "customer"
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[ValidRoles] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class UserSchema(SQLModel):
    id: int
    name: str
    email: EmailStr
    role: ValidRoles
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool

class LoginWithRole(SQLModel):
    email: EmailStr
    password: str
    role: Literal["customer", "worker"]

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    email: Optional[str] = None

class RegisterUser(SQLModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[ValidRoles] = "customer"
    is_active: Optional[bool] = True

class UserIdsRequest(SQLModel):
    user_ids: list[int]
