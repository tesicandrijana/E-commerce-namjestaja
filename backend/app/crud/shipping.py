# app/crud/shipping.py
from sqlmodel import Session, select
from app.models.models import (
    CountryCallingCode,
    RegionRate,
    ShippingZone,
    TaxRate,
    PostalCode
)


# Region Rates
def get_region_rates(db: Session):
    return db.exec(select(RegionRate)).all()

def create_region_rate(db: Session, rr: RegionRate):
    db.add(rr)
    db.commit()
    db.refresh(rr)
    return rr


# Shipping Zones
def get_shipping_zones(db: Session):
    return db.exec(select(ShippingZone)).all()

def create_shipping_zone(db: Session, sz: ShippingZone):
    db.add(sz)
    db.commit()
    db.refresh(sz)
    return sz


# Tax Rates
def get_tax_rates(db: Session):
    return db.exec(select(TaxRate)).all()

def create_tax_rate(db: Session, tr: TaxRate):
    db.add(tr)
    db.commit()
    db.refresh(tr)
    return tr


# Postal Codes
def get_postal_codes(db: Session):
    return db.exec(select(PostalCode)).all()

def create_postal_code(db: Session, pc: PostalCode):
    db.add(pc)
    db.commit()
    db.refresh(pc)
    return pc

def get_country_calling_codes(db: Session):
    return db.exec(select(CountryCallingCode)).all()

def create_country_calling_code(db: Session, ccd: CountryCallingCode):
    db.add(ccd)
    db.commit()
    db.refresh(ccd)
    return ccd