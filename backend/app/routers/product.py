from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, File
from typing import List, Annotated
from sqlmodel import Session
from app.crud.product import get_product_with_category
from app.crud import product
from app.schemas import product as product_schema
from app.services import product_service, user_service
from app.database import get_db
from app.schemas.product import ProductRead
from app.models.models import Product

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

# Read all products
@router.get("/", response_model=List[product_schema.ProductRead])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return product.get_products(db, skip=skip, limit=limit)

# Multipart PATCH for image updates and metadata
@router.patch("/{product_id}/form")
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
@router.get("/{id}", response_model = product_schema.ProductRead)
def read_product(session: SessionDep, id: int):
    return product_service.get_product(session,id)

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
