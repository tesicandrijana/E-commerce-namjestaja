from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, File, Query
from typing import List, Annotated, Optional
from sqlmodel import Session, select
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy import func
from app.crud.product import get_product_with_category
from app.crud import product
from app.schemas import product as product_schema
from app.services import product_service, user_service
from app.database import get_db, get_session
from app.models.models import Product, Discounts, OrderItem
from app.schemas.product import ProductRead

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

# Create product
@router.post("/", response_model=product_schema.ProductRead)
def create_product(
    session: SessionDep,
    name: Annotated[str, Form()],
    description: Annotated[str, Form()],
    material_id: Annotated[int, Form()],
    category_id: Annotated[int, Form()],
    length: Annotated[int, Form()],
    width: Annotated[int, Form()],
    height: Annotated[int, Form()],
    price: Annotated[int, Form()],
    quantity: Annotated[int, Form()],
    images: List[UploadFile] = File(...),
):
    return product_service.create_product(
        session, name, description, material_id, category_id, length, width, height, price, quantity, images
    )


@router.get("/recent", response_model=list[ProductRead])
def get_recent_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = Query(None)
) -> List[ProductRead]:
    one_month_ago = datetime.utcnow() - timedelta(days=30)

    statement = select(Product).where(Product.created_at >= one_month_ago)

    if category_id is not None:
        statement = statement.where(Product.category_id == category_id)

    statement = statement.order_by(Product.created_at.desc()).offset(skip).limit(limit)

    return db.exec(statement).all()



@router.get("/best-sellers", response_model=list[ProductRead])
def get_best_sellers(
    limit: int = Query(12, ge=1),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_db)
):
    statement = (
        select(Product)
        .join(OrderItem)
        .group_by(Product.id)
        .order_by(func.sum(OrderItem.quantity).desc())  
        .offset(offset)
        .limit(limit)
    )

    results = session.exec(statement).all()
    return results


@router.get("/{product_id}/sold-count")
def get_sold_count(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    sold_count = db.exec(
        select(func.sum(OrderItem.quantity))
        .where(OrderItem.product_id == product_id)
    ).first()

    return {"product_id": product_id, "sold_count": sold_count or 0}



@router.get("/manager")
def read_products_search_filter_sort(
    session: SessionDep,
    offset: int = 0,
    limit: int = 100,
    sort_by: Annotated[str, Query(enum=["name", "price","active_discount", "total_sold", "rating"])] = "name",
    sort_dir: Annotated[str,Query(enum=["asc", "desc"])] = "asc",
    out_of_stock: bool | None = None,
    material_id: int | None = None,
    category_id: int | None = None,
    search:  str | None = None,
    ):
    return product_service.get_products_search_filter_sort(session, offset,limit, sort_by, sort_dir,out_of_stock,material_id, category_id, search)

# returns total number of products, average rating, number of items that are out of stock
@router.get("/stats")
def product_stats(session: SessionDep):
    return product_service.products_stats(session)

# total number of products
@router.get("/count" )
def product_count(session: SessionDep): 
    return product_service.count_filtered_products(session)

# Read all products
@router.get("/", response_model=List[product_schema.ProductRead])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return product.get_products(db, skip=skip, limit=limit)

"""
@router.get("/new-arrivals", response_model=List[ProductRead])
def get_new_arrivals(
    limit: int = 10,
    category_id: int = Query(None),
    session: Session = Depends(get_session),
):
    statement = select(Product).options(selectinload(Product.images))

    if category_id:
        statement = statement.where(Product.category_id == category_id)

    statement = statement.order_by(Product.created_at.desc()).limit(limit)
    results = session.exec(statement).all()
    return results

"""





# Multipart PATCH for image updates and metadata
@router.patch("/{product_id}")
def update_product_form(
    session: SessionDep,
    product_id: int,
    name: Annotated[str, Form()],
    description: Annotated[str, Form()],
    material_id: Annotated[int, Form()],
    category_id: Annotated[int, Form()],
    length: Annotated[int, Form()],
    width: Annotated[int, Form()],
    height: Annotated[int, Form()],
    price: Annotated[int, Form()],
    quantity: Annotated[int, Form()],
    images: List[UploadFile] = File(default=None),
):
    return product_service.update_product(
        session, product_id, name, description, material_id, category_id,
        length, width, height, price, quantity, images
    )

# JSON PATCH or full PUT update
@router.put("/{product_id}", response_model=product_schema.ProductRead)
def update_product(
    product_id: int,
    product_update: product_schema.ProductUpdate,
    db: Session = Depends(get_db),
):
    update_data = product_update.dict(exclude_unset=True)
    updated_product = product.update_product(db, product_id, update_data)
    if updated_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product

# Read product (with optional category)
@router.get("/{id}", response_model=product_schema.ProductRead)
def read_product(session: SessionDep, id: int):
    return product_service.get_product(session, id)

#bulk delete products
@router.delete("/bulk-delete")
def bulk_delete(session:SessionDep, req: product_schema.ProductBulkDeleteReq):
    return product_service.bulk_delete(session, req)

# Delete product
@router.delete("/{id}")
def delete_product(session: SessionDep, id: int):
    return product_service.delete_product(session, id)

# Restock product
@router.patch("/{product_id}/restock")
def restock_product(
    product_id: int,
    restock_request: product_schema.RestockRequest,
    session: SessionDep,
):
    return product_service.restock(session, product_id, restock_request.added)



@router.get("/{product_id}/discounted-price")
def get_discounted_price(product_id: int, session: Session = Depends(get_db)):
    product = session.get(Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    today = date.today()

    discount = session.exec(
        select(Discounts)
        .where(Discounts.product_id == product_id)
        .where(Discounts.start_date <= today)
        .where(Discounts.end_date >= today)
    ).first()

    original_price: Decimal = product.price
    discount_amount: Decimal = discount.amount if discount else Decimal(0)
    discounted_price: Decimal = original_price * (1 - discount_amount / 100)
    discounted_price = round(discounted_price, 2)

    return {
        "product_id": product_id,
        "original_price": round(float(original_price), 2),
        "discount_amount": round(float(discount_amount), 2),
        "discounted_price": round(float(discounted_price), 2),
    }
