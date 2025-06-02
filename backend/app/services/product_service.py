from sqlmodel import Session
from app.schemas.product import ProductCreate, ManagerProductResponse, ProductBulkDeleteReq
from app.models.models import Product
from app.repositories import product_repository
from app.models.models import Product
from fastapi import HTTPException, UploadFile, File, Form
from typing import Annotated
import os
import shutil
import uuid

#save one image to static folder
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

#delete an image
def delete_image_file(image_filename: str):
    image_path = image_filename.replace("/", os.sep)
    
    if os.path.exists(image_path):
        os.remove(image_path)
        return True
    else:
        return False
    
#upload a list of images   
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

def get_products_search_filter_sort(
    session: Session, 
    offset: int = 0,
    limit: int = 100,
    sort_by: str | None = "name",
    sort_dir: str | None = "asc",
    out_of_stock: bool | None = None,
    material_id: int | None = None,
    category_id: int | None = None,
    search: str | None = None,
    ):
    filters = []

    if out_of_stock:
        filters.append(Product.quantity == 0)
    if material_id:
        filters.append(Product.material_id == material_id)
    if category_id:
        filters.append(Product.category_id == category_id)
    if search:
        filters.append(Product.name.ilike(f"%{search}%"))

    products = []
    rows = product_repository.get_products_sorted_and_filtered(session,offset,limit,sort_by,sort_dir,filters)

    for product, avg_rating, order_count,active_discount in rows:
        products.append(ManagerProductResponse(
            id=product.id,
            name=product.name,
            price=product.price,
            quantity=product.quantity,
            rating=avg_rating,
            order_count=order_count or 0,
            active_discount= active_discount or 0,
            images=product.images
        ))

    total_count = product_repository.count_filtered_products(session, filters)

    return {
        "total": total_count,
        "products": products
    }

def count_products(session:Session):
    return {"count": product_repository.count_filtered_products(session)}

def products_stats(session:Session):
    avg_rating = product_repository.avg_rating(session)
    stats = {
        "total": product_repository.count_filtered_products(session),
        "out_of_stock_count": product_repository.count_filtered_products(session, [Product.quantity == 0]) ,
        "avg_rating": avg_rating if avg_rating else 0
    }
    return stats


def bulk_delete(session:Session, req: ProductBulkDeleteReq):
    for id in req.ids:
        delete_product(session,id)