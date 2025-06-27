from fastapi import APIRouter, WebSocket, Depends
from sqlmodel import Session
from app.dependencies import get_db
from app.services import chat_service
from app.services.user_service import get_current_user
from app.models.models import User
from app.repositories import notification_repository

router = APIRouter()

#websocket chat
@router.websocket("/ws/chat/{complaint_id}")
async def chat_ws(websocket: WebSocket, complaint_id: int, db: Session = Depends(get_db)):
    await chat_service.handle_chat_ws(websocket, complaint_id, db)

#notifikacije
@router.websocket("/ws/notifications")
async def notifications_ws(websocket: WebSocket, db: Session = Depends(get_db)):
    await chat_service.handle_notifications_ws(websocket, db)

# chat api

@router.get("/complaints/{complaint_id}/messages")
def get_messages(
    complaint_id: int, 
    db: Session = Depends(get_db), 
    user: User = Depends(get_current_user)
):
    return chat_service.get_chat_messages(db, complaint_id, user)


#oznaci sve kao procitane
@router.post("/notifications/mark-read")
def mark_notifications_read(
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_repository.mark_all_as_read(session, current_user.id)
    return {"message": "All notifications marked as read"}

#grupisane neprocitane notif
@router.get("/notifications/unread")
def get_grouped_unread_notifications(
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifs = notification_repository.get_unread_notifications_grouped(session, current_user.id)
    result = []
    for notif in notifs:
        result.append({
            "id": notif.id,
            "message": notif.message,
            "from": notif.message,
            "complaint_id": notif.complaint_id,
            "created_at": notif.created_at.isoformat(),
        })
    return result

# oznaci notif za konkretan chat kao procitanu, kad korisinik klikne na notif
@router.post("/notifications/{complaint_id}/mark-read")
def mark_notification_read(
    complaint_id: int,
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_repository.mark_notification_as_read(session, current_user.id, complaint_id)
    return {"message": "Notification marked as read"}
