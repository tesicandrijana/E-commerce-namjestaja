from fastapi import FastAPI, Depends
from sqlmodel import Session, create_engine, SQLModel, Field
from sqlalchemy.exc import OperationalError
from typing import Annotated
from pydantic import BaseModel

# Globalna baza PG
db_url = "postgresql://avnadmin:AVNS_FWJcnG2WJYIgMrKPSqX@pg-3399d351-dzeny.h.aivencloud.com:25585/defaultdb?sslmode=require"

# Kreiraj engine za povezivanje sa bazom
engine = create_engine(db_url, connect_args={"sslmode": "require"}, echo=True)

# Pokušaj konekcije sa bazom
try:
    with engine.connect() as connection:
        print(" Uspješno povezano na bazu!")
except OperationalError as e:
    print("Neuspjela konekcija na bazu:", e)

# Funkcija za kreiranje tabela
#def init_db():
 #   SQLModel.metadata.create_all(bind=engine)
  #  print("✅ Tabele su uspešno kreirane u bazi!")

# Pozivanje init_db da bi se tabele kreirale prilikom pokretanja
#init_db()

# Funkcija za dobijanje sesije iz baze
def get_db():
    with Session(engine) as session:
        yield session

# SessionDep se koristi za dependency injection u FastAPI
SessionDep = Annotated[Session, Depends(get_db)]

# FastAPI endpoint za ispis svih tabela i podataka
#app = FastAPI()

