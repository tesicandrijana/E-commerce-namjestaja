from typing import Optional
from decimal import Decimal
from datetime import date
from sqlmodel import SQLModel, Field


class PostalCodeBase(SQLModel):
    country_code: str
    postal_code: str
    city: str


class PostalCodeCreate(PostalCodeBase):
    pass


class PostalCodeRead(PostalCodeBase):
    id: int

    class Config:
        orm_mode = True

class CountryCallingCodeBase(SQLModel):
    country_code: str
    calling_code: str
    tax_rate: float
    shipping_fee: float

class CountryCallingCodeRead(SQLModel):
    calling_code: str
    tax_rate: float
    shipping_fee: float

    class Config:
        orm_mode = True


class CountryCallingCodeCreate(CountryCallingCodeBase):
    pass


class CountryCallingCodeRead(CountryCallingCodeBase):
    id: int

    class Config:
        orm_mode = True