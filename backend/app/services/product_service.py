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


def save_image(product_name: str,image: Annotated[UploadFile, File(...)]):
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

    return filename

def delete_image_file(image_filename: str):
    image_path = image_filename.replace("/", os.sep)
    
    if os.path.exists(image_path):
        os.remove(image_path)
        return True
    else:
        return False
    
def images_upload(session: Session, product: Product, images: Annotated[list[UploadFile],File(...)]):
    for image in images:
            product_url = save_image(product.name,image)
            product_repository.add_product_image(session, product, product_url)
    
def delete_images_for_product(session: Session, product: Product):
        for image in product.images:
            path = product_repository.delete_product_image(session, image.id)
            delete_image_file(path)
        

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

        images_upload(session, db_product, images)

        return db_product
        
def get_product(session: Session, id: int):
    return product_repository.get_product(session, id)
 
def delete_product(session: Session, id: int):
    product = product_repository.get_product(session, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    delete_images_for_product(session, product)
    return product_repository.delete_product(session, id)

def update_product(session: Session, 
                   id: int,
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
    db_product = product_repository.get_product(session, id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    product = Product(
        id = id,
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
    if images:
        delete_images_for_product(session, db_product)
        images_upload(session, db_product, images)

    product_repository.update_product(session, id, product)

def restock(session:Session, id:int, added: int):
    product = product_repository.get_product(session, id)
    new_quantity = product.quantity + added
    return product_repository.restock(session, product, new_quantity)