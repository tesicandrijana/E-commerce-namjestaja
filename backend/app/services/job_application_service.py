import random
from app.models.models import User
from app.utils.passwords import generate_random_password
from app.services.user_service import hash_password
from fastapi import HTTPException


def generate_unique_email(app, db):
    clean_name = app.name.lower().replace(" ", "")
    role_clean = app.role.lower().replace(" ", "")
    generated_email = f"{clean_name}@furnystyle.{role_clean}.com"

    if db.query(User).filter(User.email == generated_email).first():
        random_number = random.randint(1, 999)
        generated_email = f"{clean_name}{random_number}@furnystyle.{role_clean}.com"

        if db.query(User).filter(User.email == generated_email).first():
            raise HTTPException(status_code=400, detail="Generated email already exists, please resolve manually.")

    return generated_email


def generate_user_credentials():
    generated_password = generate_random_password()
    hashed_password = hash_password(generated_password)
    return generated_password, hashed_password
