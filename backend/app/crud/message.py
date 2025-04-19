# crud/message.py
from sqlalchemy.orm import Session
from app.models.models import Message
from app.schemas.message import MessageCreate

def create_message(db: Session, message: MessageCreate):
    db_message = Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages(db: Session):
    return db.query(Message).all()

def delete_message(db: Session, message_id: int):
    message = db.query(Message).get(message_id)
    db.delete(message)
    db.commit()
    return message