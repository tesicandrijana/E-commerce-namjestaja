from typing import Optional
from sqlmodel import SQLModel, Field


class CategoryBase(SQLModel):
    name: str = Field(index=True)


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int


class CategoryUpdate(SQLModel):
    name: Optional[str] = None
