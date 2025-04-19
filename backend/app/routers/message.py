# routers/message.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import message
from app.schemas import message as message_schema
from app.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=message_schema.Message)
def create_message(message: message_schema.MessageCreate, db: Session = Depends(get_db)):
    return message.create_message(db, message)

@router.get("/", response_model=List[message_schema.Message])
def read_messages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return message.get_messages(db, skip=skip, limit=limit)

@router.get("/{message_id}", response_model=message_schema.Message)
def read_message(message_id: int, db: Session = Depends(get_db)):
    db_message = message.get_message(db, message_id)
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message