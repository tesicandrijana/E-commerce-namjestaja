# app/routers/discount.py
from fastapi import APIRouter, Depends, HTTPException,Query
from sqlmodel  import Session
from typing import List, Annotated
from app.crud import discount
from app.schemas import discount as discount_schema
from app.services import discount_service
from app.dependencies import get_db

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

@router.post("/")
def create_discounts(session: SessionDep, discount_data: list[discount_schema.DiscountCreate]):
    return discount_service.create_discounts(session, discount_data)


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
