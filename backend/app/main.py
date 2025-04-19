from fastapi import FastAPI
from app.database import Base, engine, init_db
from app.routers import user, product, category, order, review, discount

app = FastAPI()

# Register routers
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(product.router, prefix="/products", tags=["Products"])
app.include_router(category.router, prefix="/categories", tags=["Categories"])
app.include_router(order.router, prefix="/orders", tags=["Orders"])
app.include_router(review.router, prefix="/reviews", tags=["Reviews"])
app.include_router(discount.router, prefix="/discounts", tags=["Discounts"])

@app.on_event("startup")
def startup():
    # Initialize DB and create tables if they don't exist
    init_db()
    Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Furniture store backend is running!"}
