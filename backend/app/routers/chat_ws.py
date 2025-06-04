from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.dependencies import get_db
from app.models.models import Complaint, Message, User
from app.services.user_service import get_user
from app.services.user_service import get_current_user
import jwt
from app.core.config import settings

router = APIRouter()
active_connections = {}  # complaint_id: [WebSocket, WebSocket]

@router.websocket("/ws/chat/{complaint_id}")
async def chat_endpoint(websocket: WebSocket, complaint_id: int, db: Session = Depends(get_db)):
    await websocket.accept()

    # Autentifikacija preko cookie
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
    except Exception as e:
        print("Auth error:", str(e))
        await websocket.close(code=1008)
        return

    # Validacija da li korisnik ima pristup tom complaintu
    complaint = db.exec(select(Complaint).where(Complaint.id == complaint_id)).first()
    if not complaint or not complaint.order:
        await websocket.close(code=1008)
        return

    is_customer = user.id == complaint.order.customer_id
    is_support = user.id == complaint.assigned_to
    if not (is_customer or is_support):
        await websocket.close(code=1008)
        return

    # registruj konekciju
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

            #spasi poruku u bazu
            msg = Message(
                sender_id=user.id,
                receiver_id=receiver_id,
                complaint_id=complaint.id,
                content=content
            )
            db.add(msg)
            db.commit()

            # Pošalji svim aktivnim korisnicima na toj reklamaciji
            for conn in active_connections[key]:
                await conn.send_json({
                    "from": user.name,
                    "sender_id": user.id,
                    "message": content,
                    "timestamp": msg.timestamp.isoformat()
                })
            
            #salje notif u globalni notification kanal??
            notif_payload = {
                "from": user.name,
                "receiver_id": receiver_id,
                "message": content,
                "complaint_id": complaint.id,
            }
            for user_id, conn in notification_connections:   # posalji notif samo onom ko je receiver
                if user_id == receiver_id:
                    await conn.send_json(notif_payload)



    except WebSocketDisconnect:
        active_connections[key].remove(websocket)
        print("Disconnected from chat:", key)

notification_connections = []  #lista parova: (user_id, websocket)

@router.websocket("/ws/notifications")
async def notification_ws(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()

    #uzmi token iz cookija
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
    except Exception as e:
        print("Auth error:", str(e))
        await websocket.close(code=1008)
        return

    #dodaj u listu aktivnih slusalaca??
    notification_connections.append((user.id, websocket))

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        notification_connections.remove((user.id, websocket))


# chat api

@router.get("/complaints/{complaint_id}/messages")
def get_messages(complaint_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    complaint = db.exec(select(Complaint).where(Complaint.id == complaint_id)).first()

    if not complaint or not complaint.order:
        raise HTTPException(status_code=404, detail="Reklamacija nije pronađena")

    is_customer = user.id == complaint.order.customer_id
    is_support = complaint.assigned_to is not None and user.id == complaint.assigned_to

    if not (is_customer or is_support):
        raise HTTPException(status_code=403, detail="Nemate pristup ovom razgovoru")

    messages = db.exec(
        select(Message).where(Message.complaint_id == complaint_id).order_by(Message.timestamp)
    ).all()

    #Uvjeri se da se sender može pristupiti, ili koristi .sender_id i ručno dohvaćaj ime
    results = []
    for msg in messages:
        sender = db.exec(select(User).where(User.id == msg.sender_id)).first()
        results.append({
            "from": sender.name,
            "sender_id": msg.sender_id,
            "message": msg.content,
            "timestamp": msg.timestamp.isoformat()
        })
    return results

