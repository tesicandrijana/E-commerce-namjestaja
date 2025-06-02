from pydantic import BaseModel
from datetime import datetime

class MessageBase(BaseModel):
    sender_id: int
    receiver_id: int
    complaint_id: int
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

