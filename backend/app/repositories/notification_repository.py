from app.models.models import Notification, Message, User
from sqlmodel import Session, select

def save_notification(db: Session, user_id: int, message: str, complaint_id: int = None):
    #provjeri postoji li vec neprocitana notifikacija za taj user_id i complaint_id
    from app.models.models import Notification
    existing = db.exec(
        select(Notification)
        .where(
            Notification.user_id == user_id,
            Notification.complaint_id == complaint_id,
            Notification.read == False
        )
    ).first()
    if existing:
        #vec postoji neprocitana, azuriraj poruku i vrijeme
        existing.message = message 
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing
    notif = Notification(user_id=user_id, message=message, complaint_id=complaint_id)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_unread_notifications(db: Session, user_id: int):
    return db.exec(
        select(Notification)
        .where(Notification.user_id == user_id, Notification.read == False)
        .order_by(Notification.created_at)
    ).all()


# funkcija za jednu notifikaciju po complaintu:
def get_unread_notifications_grouped(db: Session, user_id: int):
    #dohvati sve neprocitane i sortiraj po complaint_id
    notifs = db.exec(
        select(Notification)
        .where(Notification.user_id == user_id, Notification.read == False)
        .order_by(Notification.created_at.desc())
    ).all()
    #zadrzi po jednu po complaintu (najnoviju)
    result = {}
    for notif in notifs:
        if notif.complaint_id not in result:
            result[notif.complaint_id] = notif
    return list(result.values())

# funkcija za oznacavanje jedne notifikacije kao procitane
def mark_notification_as_read(db: Session, user_id: int, complaint_id: int):
    from app.models.models import Notification
    notifs = db.exec(
        select(Notification)
        .where(
            Notification.user_id == user_id,
            Notification.complaint_id == complaint_id,
            Notification.read == False
        )
    ).all()
    for notif in notifs:
        notif.read = True
        db.add(notif)
    db.commit()



def mark_all_as_read(db: Session, user_id: int):
    notifs = db.exec(
        select(Notification)
        .where(Notification.user_id == user_id, Notification.read == False)
    ).all()
    for notif in notifs:
        notif.read = True
        db.add(notif)
    db.commit()


def get_sender_name_for_complaint(db: Session, complaint_id: int):
    last_msg = db.exec(
        select(Message)
        .where(Message.complaint_id == complaint_id)
        .order_by(Message.timestamp.desc())
    ).first()
    if last_msg:
        sender = db.exec(select(User).where(User.id == last_msg.sender_id)).first()
        return sender.name if sender else "Unknown"
    return "Unknown"

