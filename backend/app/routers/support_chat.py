# from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends
# from typing import Dict, List
# from collections import defaultdict
# from sqlalchemy.orm import Session
# from app.models.models import Message
# from app.dependencies import get_db
# import json
# from datetime import datetime

# router = APIRouter()

# # Ovdje čuvamo sve konekcije po complaint_id
# active_connections: Dict[int, List[WebSocket]] = defaultdict(list)

# @router.websocket("/ws/complaints/{complaint_id}")
# async def websocket_chat(websocket: WebSocket, complaint_id: int, db:Session=Depends(get_db)):
#     await websocket.accept()

#     # Dodaj konekciju za ovu reklamaciju
#     active_connections[complaint_id].append(websocket)

#     try:
#         while True:
#             raw_data = await websocket.receive_text()

#             # Pretpostavljamo da frontend šalje JSON string
#             data = json.loads(raw_data)

#             message = Message(
#                 sender_id=data["sender_id"],
#                 receiver_id=data["receiver_id"],
#                 complaint_id=complaint_id,
#                 content=data["content"],
#                 timestamp=datetime.utcnow()
#             )

#             # db.add(message)
#             # db.commit()
#             try:
#                 db.add(message)
#                 db.commit()
#             except Exception as e:
#                 db.rollback()
#                 print(f"❌ Error saving message: {e}")
#                 await websocket.send_text("error: message not saved")
#                 return


#             # Kada neko pošalje poruku, šaljemo je svima u toj sobi
#             for conn in active_connections[complaint_id]:
#                 await conn.send_text(json.dumps({
#                     "content": message.content,
#                     "sender_id": message.sender_id,
#                     "timestamp": str(message.timestamp)
#                 }))

#     except WebSocketDisconnect:
#         # Ukloni korisnika kada se diskonektuje
#         active_connections[complaint_id].remove(websocket)
