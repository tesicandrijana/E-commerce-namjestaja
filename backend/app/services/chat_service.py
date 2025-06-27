from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from sqlmodel import Session, select
from app.models.models import Complaint, Message, User
from app.repositories import message_repository
from app.services.user_service import get_user
from app.core.config import settings
from app.repositories import notification_repository
import jwt
from datetime import datetime

active_connections = {}           # complaint_id : [WebSocket, ...]
notification_connections = []     # list of (user_id, WebSocket)

async def handle_chat_ws(websocket: WebSocket, complaint_id: int, db: Session):
    await websocket.accept()
    #autentikacija korisnika iz cookie
    token = websocket.cookies.get("access_token")
    if not token:
        await websocket.close(code=1008)
        return
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        user = get_user(db, email)
        if not user:
            raise Exception("User not found")
    except Exception:
        await websocket.close(code=1008)
        return

    #   validacija pristupa
    complaint = db.exec(select(Complaint).where(Complaint.id == complaint_id)).first()
    if not complaint or not complaint.order:
        await websocket.close(code=1008)
        return

    is_customer = user.id == complaint.order.customer_id
    is_support = user.id == complaint.assigned_to
    if not (is_customer or is_support):
        await websocket.close(code=1008)
        return

    #registruj websocket konekciju
    key = str(complaint_id)
    if key not in active_connections:
        active_connections[key] = []
    active_connections[key].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            content = data.get("message")
            if not content:
                continue

            receiver_id = (
                complaint.assigned_to if is_customer else complaint.order.customer_id
            )

            #save poruku u bazu preko rep
            msg = message_repository.save_message(
                db, user.id, receiver_id, complaint.id, content
            )

            #posalji svim konektovanim korisnicima na toj reklamaciji
            for conn in active_connections[key]:
                await conn.send_json({
                    "from": user.name,
                    "sender_id": user.id,
                    "message": content,
                    "timestamp": msg.timestamp.isoformat()
                })

            #novo:prije slanja notifikacije,spremi je u bazuu
            notification_repository.save_notification(
                db, user_id=receiver_id, message=content, complaint_id=complaint.id
            )
                        
            #posalji notifikaciju preko notification websocketa
            notif_payload = {
                "from": user.name,
                "receiver_id": receiver_id,
                "message": content,
                "complaint_id": complaint.id,
            }
            for user_id, conn in notification_connections:
                if user_id == receiver_id:
                    await conn.send_json(notif_payload)

    except WebSocketDisconnect:
        active_connections[key].remove(websocket)




async def handle_notifications_ws(websocket: WebSocket, db: Session):
    await websocket.accept()
    token = websocket.cookies.get("access_token")
    if not token:
        await websocket.close(code=1008)
        return
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        user = get_user(db, email)
        if not user:
            raise Exception("User not found")
    except Exception:
        await websocket.close(code=1008)
        return
    


    #novo:posalji sve neprocitane notifikacije
    unread = notification_repository.get_unread_notifications(db, user.id)
    for notif in unread:
        await websocket.send_json({
            "message": notif.message,
            "complaint_id": notif.complaint_id,
            "timestamp": notif.created_at.isoformat(),
        })
# 




    notification_connections.append((user.id, websocket))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        notification_connections.remove((user.id, websocket))


def get_chat_messages(db: Session, complaint_id: int, user: User):
    complaint = db.exec(select(Complaint).where(Complaint.id == complaint_id)).first()
    if not complaint or not complaint.order:
        raise HTTPException(status_code=404, detail="Complaint not found")

    is_customer = user.id == complaint.order.customer_id
    is_support = complaint.assigned_to is not None and user.id == complaint.assigned_to

    if not (is_customer or is_support):
        raise HTTPException(status_code=403, detail="You don't have access to this conversation")

    messages = message_repository.get_messages_by_complaint(db, complaint_id)
    results = []
    for msg in messages:
        sender = db.exec(select(User).where(User.id == msg.sender_id)).first()
        results.append({
            "from": sender.name if sender else "Unknown",
            "sender_id": msg.sender_id,
            "message": msg.content,
            "timestamp": msg.timestamp.isoformat()
        })
    return results
