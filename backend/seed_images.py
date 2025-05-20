from sqlmodel import Session
from app.database import engine
from app.schemas.product_image import ProductImageCreate
from app.crud.product_image import create_product_image

def main():
    with Session(engine) as db:
        images = [
            ProductImageCreate(product_id=1, image_url="/static/product_images/Modern_sofa.webp"),
            ProductImageCreate(product_id=2, image_url="/static/product_images/Coffee_table..jfif"),
            ProductImageCreate(product_id=3, image_url="/static/product_images/TV_stand.webp"),
        ]

        for img in images:
            create_product_image(db, img)
            print(f"Inserted image for product_id {img.product_id}: {img.image_url}")

if __name__ == "__main__":
    main()
