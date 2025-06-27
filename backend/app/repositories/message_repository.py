from app.models.models import Message
from sqlmodel import Session, select

def save_message(db: Session, sender_id: int, receiver_id: int, complaint_id: int, content: str):
    msg = Message(sender_id=sender_id,receiver_id=receiver_id,complaint_id=complaint_id,content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_messages_by_complaint(db: Session, complaint_id: int):
    return db.exec(
        select(Message)
        .where(Message.complaint_id == complaint_id)
        .order_by(Message.timestamp)
    ).all()
