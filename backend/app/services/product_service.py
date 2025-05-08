from sqlmodel import Session
from app.schemas.product import ProductCreate
from app.models.models import Product
from app.repositories import product_repository
from app.models.models import Product
from fastapi import HTTPException, UploadFile, File, Form
from typing import Annotated
import os
import shutil
import uuid


def image_upload(product_name: str,image: Annotated[UploadFile, File(...)]):
    upload_dir = "static/product_images"
    
    if image.content_type not in ["image/jpeg", "image/png", "image/gif","image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
        
    os.makedirs(upload_dir, exist_ok=True)

    extension = os.path.splitext(image.filename)[1]

    safe_product_name = product_name.replace(" ", "_").lower()
    unique_id = str(uuid.uuid4())
    filename = f"{safe_product_name}_{unique_id}{extension}"
    file_path = os.path.join(upload_dir, filename)

    try: 
        with open(file_path, "wb") as out_file:
            shutil.copyfileobj(image.file, out_file)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save file")
    finally: 
        image.file.close()

    return file_path


def create_product(session: Session,
                   name: Annotated[str, Form()],
                   description: Annotated[str, Form()],
                   material_id: Annotated[int, Form()],
                   category_id: Annotated[int, Form()],
                   length: Annotated[int, Form()],
                   width: Annotated[int, Form()],
                   height: Annotated[int, Form()],
                   price: Annotated[int, Form()],
                   quantity: Annotated[int, Form()],
                   images: Annotated[list[UploadFile],File(...)]):
        product = Product(
             name = name,
             description = description,
             material_id = material_id,
             category_id = category_id,
             length = length,
             width = width,
             height = height,
             price = price,
             quantity = quantity
        )
        db_product = product_repository.create_product(session, product)
        for image in images:
            product_url = image_upload(name,image)
            print(product_url)
            product_repository.add_product_image(session, db_product, product_url)

        return db_product
        

