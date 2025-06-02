from sqlmodel import Session
from typing import Annotated
from fastapi import HTTPException
from app.schemas import discount as discount_schema
from app.repositories import discount_repository
from app.models.models import Discount

def overlapping_discount(session: Session, discount_data: discount_schema.DiscountCreate):
    discount = Discount(**discount_data.model_dump())
    return discount_repository.overlapping_discount(session,discount)

def create_discount(session: Session, discount_data: discount_schema.DiscountCreate):
    
        overlap = overlapping_discount(session,discount_data)
        if overlap != []:
            product_name = overlap[0].product.name
            overlaps_info = [
            f"ID {d.id}: {d.start_date} to {d.end_date} ({d.amount}%)"
            for d in overlap
            ]
            raise HTTPException(
                status_code=400,
                detail=f"Overlapping discounts for  {product_name}:"+"\n".join(overlaps_info)
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
                detail="Some discounts could not be created due to overlaps:\n" + "\n\n".join(overlaps)
            )
        
    return added_discounts
        
            
