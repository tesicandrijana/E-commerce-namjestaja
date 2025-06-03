# app/crud/shipping.py
from sqlmodel import Session, select
from app.models.models import (
    CountryCallingCode,
    TaxRate,
    PostalCode
)


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