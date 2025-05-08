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
    
