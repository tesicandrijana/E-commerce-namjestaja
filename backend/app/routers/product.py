from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form,File
from typing import List, Annotated
from sqlmodel import Session
from app.crud import product
from app.schemas import product as product_schema
from app.services import product_service, user_service
from app.database import get_db
from app.models.models import User,Product

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


@router.get("/{id}", response_model = product_schema.ProductBase)
def read_product(
    session: SessionDep,
    id: int
):
    return product_service.get_product(session,id)



@router.patch("/{id}")
def update_product(session: SessionDep, id:int, name: Annotated[str, Form()],
                   description: Annotated[str, Form()],
                   material_id: Annotated[int, Form()],
                   category_id: Annotated[int, Form()],
                   length: Annotated[int, Form()],
                   width: Annotated[int, Form()],
                   height: Annotated[int, Form()],
                   price: Annotated[int, Form()],
                   quantity: Annotated[int, Form()],
                   images: list[UploadFile] = File(default=None)):
    return product_service.update_product(session, id,name, description, material_id, category_id, length, width, height, price, quantity, images)


@router.delete("/{id}")
def delete_product(session: SessionDep, id: int):
    return product_service.delete_product(session, id)


