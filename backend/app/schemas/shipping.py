from typing import Optional
from decimal import Decimal
from datetime import date
from sqlmodel import SQLModel, Field


class RegionRateBase(SQLModel):
    country: str
    city: Optional[str] = None
    postal_code: Optional[str] = None
    tax_rate: Decimal
    shipping_cost: Decimal


class RegionRateCreate(RegionRateBase):
    pass


class RegionRateRead(RegionRateBase):
    id: int

    class Config:
        orm_mode = True


class ShippingZoneBase(SQLModel):
    name: str
    countries: str
    base_cost: Decimal


class ShippingZoneCreate(ShippingZoneBase):
    pass


class ShippingZoneRead(ShippingZoneBase):
    id: int

    class Config:
        orm_mode = True


class TaxRateBase(SQLModel):
    country_code: str
    vat_rate: Decimal
    effective_from: date


class TaxRateCreate(TaxRateBase):
    pass


class TaxRateRead(TaxRateBase):
    id: int

    class Config:
        orm_mode = True


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


class CountryCallingCodeCreate(CountryCallingCodeBase):
    pass


class CountryCallingCodeRead(CountryCallingCodeBase):
    id: int

    class Config:
        orm_mode = True
