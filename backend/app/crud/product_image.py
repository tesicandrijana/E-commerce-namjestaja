from sqlmodel import Session, select
from app.models.models import ProductImage
from app.schemas.product_image import ProductImageCreate, ProductImageUpdate

def create_product_image(db: Session, product_image_create: ProductImageCreate) -> ProductImage:
    product_image = ProductImage.from_orm(product_image_create)
    db.add(product_image)
    db.commit()
    db.refresh(product_image)
    return product_image

def get_product_image(db: Session, image_id: int) -> ProductImage | None:
    statement = select(ProductImage).where(ProductImage.id == image_id)
    result = db.exec(statement).first()
    return result

def get_product_images_by_product(db: Session, product_id: int) -> list[ProductImage]:
    statement = select(ProductImage).where(ProductImage.product_id == product_id)
    return db.exec(statement).all()

def update_product_image(db: Session, image_id: int, updates: dict) -> ProductImage | None:
    db_image = get_product_image(db, image_id)
    if not db_image:
        return None
    for key, value in updates.items():
        setattr(db_image, key, value)
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

def delete_product_image(db: Session, image_id: int) -> ProductImage | None:
    db_image = get_product_image(db, image_id)
    if not db_image:
        return None
    db.delete(db_image)
    db.commit()
    return db_image
