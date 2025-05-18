from sqlmodel import Session, select
from app.models.models import Material

def get_materials(session: Session, offset: int = 0, limit: int = 100)->list[Material]:
    return session.exec(select(Material).offset(offset).limit(limit)).all()

def get_material(session: Session, id: int) -> Material:
    return session.exec(select(Material).where(Material.id == id)).first()