from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import SQLModel
from app.database import engine, SessionDep
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine
from app.routers import user, product, category, order, order_item, review, discount, material, cart,support, complaint, support_orders, chat_ws, shipping
from sqlalchemy.orm import configure_mappers


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    configure_mappers()
    yield


app = FastAPI(lifespan=lifespan)
origins = [
    "http://localhost:8000",
    "http://localhost:3000",  
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (for serving product images, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS settings


# Register routers
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(product.router, prefix="/products", tags=["Products"])
app.include_router(category.router, prefix="/categories", tags=["Categories"])
app.include_router(order.router, prefix="/orders", tags=["Orders"])
app.include_router(order_item.router, prefix="/order_item", tags=["Order_item"])
app.include_router(review.router, prefix="/reviews", tags=["Reviews"])
app.include_router(discount.router, prefix="/discounts", tags=["Discounts"])
app.include_router(material.router, prefix="/materials", tags=["Materials"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(support.router, prefix="/support", tags=["Support"])
app.include_router(complaint.router, prefix="/complaints", tags=["Complaints"])
app.include_router(support_orders.router, tags=["Support Orders"])
app.include_router(shipping.router, prefix="/taxes-shipping", tags=["TaxRate"])
app.include_router(chat_ws.router)

@app.get("/")
def read_root():
    return {"message": "Furniture store backend is running!"}

@app.post("/cart/add")
async def add_to_cart():
    return {"message": "Product added to cart!"}

@app.get("/ping")
def ping():
    return {"status": "ok"}


