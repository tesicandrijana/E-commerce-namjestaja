# app/core/config.py
from pydantic_settings import BaseSettings  # This is the new import


class Settings(BaseSettings):
    # Database
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./furniture_store.db"

    # JWT
    SECRET_KEY: str = "your-very-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"   # optional: load from .env in project root
        env_file_encoding = "utf-8"

settings = Settings()
