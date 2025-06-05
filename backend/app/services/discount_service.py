from sqlmodel import Session
from typing import Annotated
from fastapi import HTTPException
from app.schemas import discount as discount_schema
from app.repositories import discount_repository
from app.models.models import Discount, Product
from sqlalchemy import and_
from datetime import date

def overlapping_discount(session: Session, discount_data: discount_schema.DiscountCreate):
    discount = Discount(**discount_data.model_dump())
    return discount_repository.overlapping_discount(session,discount)

def create_discount(session: Session, discount_data: discount_schema.DiscountCreate):
        if discount_data.start_date > discount_data.end_date:
            raise HTTPException(status_code=400, detail="Discount start date can't be after discount end date.")
    
        overlap = overlapping_discount(session,discount_data)
        if overlap != []:
            product_name = overlap[0].product.name
            overlaps_info = [
            f"ID {d.id}: {d.start_date} to {d.end_date} ({d.amount}%)"
            for d in overlap
            ]
            raise HTTPException(
                status_code=400,
                detail=f"{product_name}:"+"\n".join(overlaps_info)
            )
        discount = Discount(**discount_data.model_dump())
        return discount_repository.create_discount(session,discount)

def create_discounts(session: Session, discounts: list[discount_schema.DiscountCreate]):
    overlaps = []
    added_discounts = []
    with session.begin():
        for discount in discounts:
            try:
                d = create_discount(session, discount)
                added_discounts.append(d)
            except HTTPException as e:
                overlaps.append(e.detail)

        if overlaps != []:
            raise HTTPException(
                status_code=400,
                detail="Couldn't create discounts due to overlap:\n" + "\n\n".join(overlaps)
            )
        
    return added_discounts


def get_discounts(
        session:Session, 
        offset: int = 0, 
        limit: int = 100,
        sort_by: str | None = "id",
        sort_dir: str | None = "asc",
        active: bool | None = None,
        search: str | None = None
        ):
    today = date.today()
    filters = []
    if active is True:
        filters.append(and_(Discount.start_date <= today, Discount.end_date >= today))
    if search:
        filters.append(Product.name.ilike(f"%{search}%"))

        
    return {
            "discounts":discount_repository.get_discounts(session,offset,limit,sort_by,sort_dir, filters),
            "count" : discount_repository.discount_count(session,filters)
        }


def edit_discount(session: Session, id:int, discount_data: discount_schema.DiscountUpdate):
    today = date.today()
    discount = discount_repository.get_discount_by_id(session,id)

    #can't edit discount that is over
    print(discount_data.amount)
    if discount_data.amount and discount_data.amount < 0:
            raise HTTPException(status_code=400, detail="Amount can't be negative.")

    if discount_data.end_date and discount.end_date < today:
        raise HTTPException(status_code=400, detail="You can't edit discount that is over.")
    
    if discount_data.start_date and discount_data.end_date and (discount_data.start_date > discount_data.end_date):
        raise HTTPException(status_code=400, detail="Start date after end date.")
    
    if discount_data.start_date and discount_data.end_date and (discount_data.start_date < today or discount.end_date < today):
        raise HTTPException(status_code=400, detail="Date can't be changed to date that has already passed.")



    if discount_data.amount is not None:
        discount.amount = discount_data.amount
    if discount_data.start_date:
        discount.start_date = discount_data.start_date
    if discount_data.end_date:
        discount.end_date = discount_data.end_date
    
    return discount_repository.edit_discount(session, discount)
        
            
