from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional
from app.models.models import TaxRate, PostalCode, CountryCallingCode
from app.database import get_db
from app.crud.shipping import (
    get_tax_rates, 
    get_postal_codes, 
    create_country_calling_code,
    get_country_calling_codes)

from app.schemas.shipping import (
    RegionRateRead, ShippingZoneRead,
    TaxRateCreate, TaxRateRead,
    PostalCodeCreate, PostalCodeRead,
    CountryCallingCodeCreate, CountryCallingCodeRead
)

router = APIRouter()

@router.get("/")
def shipping_root():
    return {"message": "Shipping API root. Available endpoints: /region-rates, /tax-rates, /postal-codes, /calling-codes"}


@router.get("/country-code/")
def get_country_code(
    city: str = Query(..., description="City name"),
    postal_code: str = Query(..., description="Postal code"),
    db: Session = Depends(get_db)
):
    statement = select(PostalCode).where(
        PostalCode.city == city,
        PostalCode.postal_code == postal_code
    )
    result = db.exec(statement).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Country code not found for given city and postal code")

    return {"country_code": result.country_code}


@router.post("/tax-rates/", response_model=TaxRateRead)
def create_tax_rate(tr: TaxRateCreate, db: Session = Depends(get_db)):
    tr_obj = TaxRate(**tr.dict())
    return create_tax_rate(db, tr_obj)

@router.get("/tax-rates/", response_model=list[TaxRateRead])
def read_tax_rates(db: Session = Depends(get_db)):
    return get_tax_rates(db)


@router.post("/postal-codes/", response_model=PostalCodeRead)
def create_postal_code(pc: PostalCodeCreate, db: Session = Depends(get_db)):
    pc_obj = PostalCode(**pc.dict())
    return create_postal_code(db, pc_obj)

@router.get("/postal-codes/", response_model=list[PostalCodeRead])
def read_postal_codes(db: Session = Depends(get_db)):
    return get_postal_codes(db)


@router.post("/calling-codes/", response_model=CountryCallingCodeRead)
def create_calling_code(cc: CountryCallingCodeCreate, db: Session = Depends(get_db)):
    cc_obj = CountryCallingCode(**cc.dict())
    return create_country_calling_code(db, cc_obj)

@router.get("/calling-codes/", response_model=list[CountryCallingCodeRead])
def read_calling_codes(db: Session = Depends(get_db)):
    return get_country_calling_codes(db)

@router.get("/tax-rate")
def get_tax_rate_by_country_code(country_code: str = Query(...), db: Session = Depends(get_db)):
    tax_rate = db.exec(
        select(TaxRate)
        .where(TaxRate.country_code == country_code)
        .order_by(TaxRate.effective_from.desc())
    ).first()
    if not tax_rate:
        raise HTTPException(status_code=404, detail="Tax rate not found for country_code: " + country_code)
    return {"tax_rate": float(tax_rate.vat_rate)}
