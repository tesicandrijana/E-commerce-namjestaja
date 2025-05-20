from sqlmodel import Session
from app.database import engine
from app.models.models import Material  # adjust import as needed

materials = [
    "Wood",
    "Metal",
    "Glass",
    "Plastic",
    "Leather",
    "Fabric",
    "Stone"
]

def insert_materials():
    with Session(engine) as session:
        for name in materials:
            # Check if material already exists to avoid duplicates
            existing = session.query(Material).filter(Material.name == name).first()
            if not existing:
                material = Material(name=name)
                session.add(material)
        session.commit()
        print("Inserted materials (if not existed).")

if __name__ == "__main__":
    insert_materials()
