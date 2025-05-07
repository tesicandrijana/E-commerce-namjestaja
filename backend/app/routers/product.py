from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form,File
from typing import List, Annotated
from sqlmodel import Session
from app.crud import product
from app.schemas import product as product_schema
from app.services import product_service
from app.database import get_db

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_db)]

@router.post("/") 
def create_product(session: SessionDep, 
                   name: Annotated[str, Form()],
                   description: Annotated[str, Form()],
                   material_id: Annotated[int, Form()],
                   category_id: Annotated[int, Form()],
                   length: Annotated[int, Form()],
                   width: Annotated[int, Form()],
                   height: Annotated[int, Form()],
                   price: Annotated[int, Form()],
                   quantity: Annotated[int, Form()],
                   images: list[UploadFile] = File(...)):
    return product_service.create_product(session, name, description, material_id, category_id, length, width, height, price, quantity, images)


@router.get("/", response_model=List[product_schema.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return product.get_products(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=product_schema.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = product.get_product(db, product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.put("/{product_id}", response_model=product_schema.Product)
def update_product(product_id: int, product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    return product.update_product(db, product_id, product)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    return product.delete_product(db, product_id)


