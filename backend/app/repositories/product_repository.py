from sqlmodel import Session, select
from app.models.models import Product, ProductImage

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