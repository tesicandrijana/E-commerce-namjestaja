from app.database import get_db, engine
from app.models.models import Product, Category, Material
from sqlmodel import Session, select

def insert_sample_products():
    with Session(engine) as session:
        # Check or create category "Living Room"
        category = session.exec(select(Category).where(Category.name == "Living Room")).first()
        if not category:
            category = Category(name="Living Room")
            session.add(category)
            session.commit()
            session.refresh(category)

        # Assuming you have a default material or nullable
        material = session.exec(select(Material).limit(1)).first()  # Just pick one for example
        if not material:
            material = None  # or create one material here

        # Prepare products
        products = [
            Product(
                name="Modern Sofa",
                price=1200,
                rating=4.8,
                image="https://i5.walmartimages.com/asr/823f1e50-b827-4cfd-9f30-3897cb5fcfad.bf223222239f8933b96feb796a5013e6.jpeg",
                category_id=category.id,
                material_id=material.id if material else None,
                description="",
                length=0,
                width=0,
                height=0,
                quantity=10,
            ),
            Product(
                name="Coffee Table",
                price=230,
                rating=4.5,
                image="https://th.bing.com/th/id/OIP.UM0PypRIkEMCmKXdy9JrlgHaHa?cb=iwp2&rs=1&pid=ImgDetMain",
                category_id=category.id,
                material_id=material.id if material else None,
                description="",
                length=0,
                width=0,
                height=0,
                quantity=10,
            ),
            Product(
                name="TV Stand",
                price=300,
                rating=4.4,
                image="https://cdn.shopify.com/s/files/1/2781/6416/products/meble-furniture-entertainment-centers-tv-stands-eva-77-tv-stand-21320846344354_1400x.png?v=1669489701",
                category_id=category.id,
                material_id=material.id if material else None,
                description="",
                length=0,
                width=0,
                height=0,
                quantity=10,
            ),
        ]

        for product in products:
            session.add(product)
        session.commit()

if __name__ == "__main__":
    insert_sample_products()
