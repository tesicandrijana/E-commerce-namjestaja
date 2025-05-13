from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import SQLModel
from app.database import engine, SessionDep
from app.routers import user, product, category, order, review, discount,material
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://localhost:8000",
    "http://localhost:3000",  
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(product.router, prefix="/products", tags=["Products"])
app.include_router(category.router, prefix="/categories", tags=["Categories"])
app.include_router(order.router, prefix="/orders", tags=["Orders"])
app.include_router(review.router, prefix="/reviews", tags=["Reviews"])
app.include_router(discount.router, prefix="/discounts", tags=["Discounts"])
app.include_router(material.router, prefix="/materials", tags=["Materials"])

@app.get("/")
def read_root():
    return {"message": "Furniture store backend is running!"}
