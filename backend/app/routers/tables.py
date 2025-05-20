from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlmodel import Session
from app.database import get_db  # your existing database session dependency

router = APIRouter()

@router.get("/tables")
def get_table_names(db: Session = Depends(get_db)):
    result = db.execute(text(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    ))
    tables = [row[0] for row in result]
    return {"tables": tables}
