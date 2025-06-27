from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlmodel import Session, select
from typing import List
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.database import get_session, get_db
from app.models.models import Product, OrderItem, Review
from app.schemas.product import ProductRead
from sqlalchemy import func

from app.crud import category as category_crud

router = APIRouter()

@router.post("/", response_model=CategoryRead)
def create_category(
    category_data: CategoryCreate,
    session: Session = Depends(get_session)
):
    existing = category_crud.get_category_by_name(session, category_data.name)
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    return category_crud.create_category(session, category_data)




@router.get("/category-highlights/{category_id}")
def get_category_highlights(category_id: int, session: Session = Depends(get_db)):
    # Best seller: most sold product in this category
    best_seller_stmt = (
        select(Product, func.sum(OrderItem.quantity).label("units_sold"))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .where(Product.category_id == category_id)
        .group_by(Product.id)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(1)
    )
    best_seller_result = session.exec(best_seller_stmt).first()
    best_seller = None
    if best_seller_result:
        best_seller_obj, units_sold = best_seller_result
        best_seller = ProductRead.from_orm(best_seller_obj)
        best_seller.units_sold = units_sold

    # Top rated: highest average rating in this category
    top_rated_stmt = (
        select(Product, func.avg(Review.rating).label("average_rating"))
        .join(Review, Review.product_id == Product.id)
        .where(Product.category_id == category_id)
        .group_by(Product.id)
        .order_by(func.avg(Review.rating).desc())
        .limit(1)
    )
    top_rated_result = session.exec(top_rated_stmt).first()
    highest_rated = None
    if top_rated_result:
        top_rated_obj, average_rating = top_rated_result
        highest_rated = ProductRead.from_orm(top_rated_obj)
        highest_rated.average_rating = float(average_rating)

    return {
        "best_seller": best_seller,
        "highest_rated": highest_rated,
    }



@router.get("/", response_model=List[CategoryRead])
def read_categories(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    session: Session = Depends(get_session)
):
    return category_crud.get_categories(session, offset, limit)


@router.get("/{category_id}", response_model=CategoryRead)
def read_category(category_id: int, session: Session = Depends(get_session)):
    category = category_crud.get_category(session, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    updates: CategoryUpdate,
    session: Session = Depends(get_session)
):
    updated = category_crud.update_category(session, category_id, updates.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/{category_id}")
def delete_category(category_id: int, session: Session = Depends(get_session)):
    success = category_crud.delete_category(session, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted successfully"}
