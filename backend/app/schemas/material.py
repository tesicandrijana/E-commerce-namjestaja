from sqlmodel import SQLModel, Field
from typing import Optional

class MaterialBase(SQLModel):
    name: str

class Material(MaterialBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class MaterialRead(MaterialBase):
    id: int

class Config:
    from_attributes = True
