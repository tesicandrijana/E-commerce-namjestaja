from sqlmodel import Session, select
from app.models.models import Product, ProductImage,Review,OrderItem,Discounts
from app.schemas import product as product_schema
from sqlalchemy import func,desc,and_, case
from typing import Any
from datetime import date

def create_product(session: Session, product: Product) -> Product:
    session.add(product)
    session.commit()
    session.refresh(product)

    return product

def add_product_image(session: Session, product: Product, url: str): 
    product_image = ProductImage(
        product = product,
        image_url = url
    )
    session.add(product_image)
    session.commit()
    session.refresh(product_image)

def get_product(session: Session, id: int):
    return session.exec(select(Product).where(Product.id == id)).one()

def delete_product(session: Session, id:int):    
    product = session.exec(select(Product).where(Product.id == id)).first()
    session.delete(product)
    session.commit()
    return {"ok": True}

def delete_product_image(session: Session, id: int):
    product_image = session.exec(select(ProductImage).where(ProductImage.id == id)).first()
    img_url = product_image.image_url
    session.delete(product_image)
    session.commit()
    return img_url

def update_product(session: Session, id: int, product: Product):
    db_product = get_product(session, id)
    db_product.sqlmodel_update(product)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)

    return db_product

def restock(session: Session, db_product: Product, new_quantity: int):
    db_product.quantity = new_quantity
    session.add(db_product)
    session.commit()
    session.refresh(db_product)

def get_products_sorted_and_filtered(
        session: Session, 
        offset: int = 0, 
        limit: int = 100,
        sort_by: str | None = "name",
        sort_dir: str | None = "asc",
        filters: list[Any] = []
        ) ->list[Product]:
    
    today = date.today()
    rating_avg = func.avg(Review.rating).label("avg_rating")
    total_sold = func.coalesce(func.sum(OrderItem.quantity), 0).label("order_count")
    active_discount_amount = func.max(
        case(
            (and_(
                Discounts.start_date <= today,
                Discounts.end_date >= today
            ), Discounts.amount),
            else_=None
        )
    ).label("active_discount")

    stmt = (
        select(Product, rating_avg, total_sold,active_discount_amount)
        .outerjoin(Review, Product.id == Review.product_id)
        .outerjoin(OrderItem, Product.id == OrderItem.product_id)
        .outerjoin(Discounts, Product.id == Discounts.product_id)
        .group_by(Product.id)
        .offset(offset)
        .limit(limit)
    )

    if filters:
        stmt = stmt.where(*filters)

    if sort_by == "rating":
        order_column = rating_avg
    elif sort_by == "order_count":
        order_column = total_sold
    elif sort_by == "active_discount":
        order_column = active_discount_amount
    else:
        order_column = getattr(Product, sort_by)

    stmt = stmt.order_by(desc(order_column).nulls_last() if sort_dir == "desc" else order_column.nulls_last())

    return session.exec(stmt).all()

def count_filtered_products(session:Session,filters: list[Any] = []):
    stmt = select(func.count(Product.id))
    if filters:
        stmt = stmt.where(*filters)
    return session.exec(stmt).one()

def products_out_of_stock(session: Session):
    return session.exec(select(func.count(Product.id)).where(Product.quantity == 0)).one()

def avg_rating(session: Session):
    return session.exec(select(func.avg(Review.rating))).one()