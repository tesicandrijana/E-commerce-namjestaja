# app/routers/discount.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel  import Session, select
from typing import List, Annotated
from datetime import date
from sqlalchemy import desc
from app.schemas import discount as discount_schema
from app.schemas.product import ProductRead
from app.models.models import Discounts, Product
from app.services import discount_service
from app.dependencies import get_db

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

@router.post("/")
def create_discounts(session: SessionDep, discount_data: list[discount_schema.DiscountCreate]):
    return discount_service.create_discounts(session, discount_data)

@router.get("/all", response_model=List[Discounts])
def read_discounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    discounts = db.exec(select(Discounts).offset(skip).limit(limit)).all()
    return discounts

@router.get("/", response_model=discount_schema.ReadDiscountsResponse)
def read_discounts(
    session: SessionDep,
    offset: int = 0, 
    limit: int = 100,
    sort_by: Annotated[str, Query(enum=["id", "product","amount", "start_date", "end_date"])] = "id",
    sort_dir: Annotated[str,Query(enum=["asc", "desc"])] = "asc",
    active: bool | None = None,
    search:  str | None = None,
    ):

    return discount_service.get_discounts(session,offset,limit,sort_by, sort_dir,active,search)


@router.put("/{discount_id}")
def edit_discount(session: SessionDep,discount_id:int, discount_data:discount_schema.DiscountUpdate):
    return discount_service.edit_discount(session,discount_id,discount_data)


@router.get("/discounted", response_model=List[ProductRead])
def get_discounted_products(
    session: Session = Depends(get_db),
    limit: int = Query(12, ge=1),
    offset: int = Query(0, ge=0)
):
    today = date.today()

    statement = (
        select(Product)
        .join(Discounts, Discounts.product_id == Product.id)
        .where(Discounts.start_date <= today)
        .where(Discounts.end_date >= today)
        .order_by(desc(Discounts.amount))
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()

