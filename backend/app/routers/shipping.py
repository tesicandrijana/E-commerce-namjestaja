from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from app.services.user_service import get_current_user
from app.models.models import PostalCode, CountryCallingCode, CartItem, Product, Discounts, OrderItem, User
from app.schemas.shipping import CountryCallingCodeBase
from app.database import get_db, get_session
from app.crud.shipping import (
    get_postal_codes, 
    create_country_calling_code,
    get_country_calling_codes)

from app.schemas.shipping import (
    PostalCodeCreate, PostalCodeRead,
    CountryCallingCodeCreate, CountryCallingCodeRead
)

router = APIRouter()

@router.get("/")
def shipping_root():
    return {"message": "Shipping API root. Available endpoints: /postal-codes, /calling-codes"}



@router.get("/taxes")
def get_tax_rates(session: Session = Depends(get_session)):
    statement = select(CountryCallingCode.country_code, CountryCallingCode.tax_rate)
    results = session.exec(statement).all()
    return [{"country_code": code, "vat_rate": rate} for code, rate in results]


@router.get("/shipping")
def get_shipping_fees(session: Session = Depends(get_session)):
    statement = select(CountryCallingCode.country_code, CountryCallingCode.shipping_fee)
    results = session.exec(statement).all()
    return [{"country_code": code, "shipping_rate": fee} for code, fee in results]



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




