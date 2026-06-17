from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from jose import jwt, JWTError
from datetime import datetime, timedelta

import os
import mercadopago

from dotenv import load_dotenv
# =========================
# JWT CONFIG
# =========================
SECRET_KEY = "secreto_super_seguro"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# =========================
# APP
# =========================
app = FastAPI()
load_dotenv()

MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")
print("TOKEN MP:", MP_ACCESS_TOKEN[:10])
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://contents-overreach-step.ngrok-free.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# DATABASE
# =========================
DATABASE_URL = "sqlite:///./participantes.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class ParticipanteDB(Base):
    __tablename__ = "participantes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    email = Column(String)
    edad = Column(Integer)
    pais = Column(String)
    modalidad = Column(String)
    tecnologias = Column(String)
    nivel = Column(String)
    aceptaTerminos = Column(Boolean)

Base.metadata.create_all(bind=engine)

# =========================
# MODELOS
# =========================
class Participante(BaseModel):
    id: int
    nombre: str
    email: str
    edad: int
    pais: str
    modalidad: str
    tecnologias: list[str]
    nivel: str
    aceptaTerminos: bool

class LoginData(BaseModel):
    username: str
    password: str
class CursoData(BaseModel):
    titulo: str
    precio: float
# =========================
# USERS SIMULADOS
# =========================
users_db = {
    "admin": {"username": "admin", "password": "123", "rol": "ADMIN"},
    "user": {"username": "user", "password": "123", "rol": "CONSULTA"}
}

# =========================
# JWT HELPERS
# =========================
def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# =========================
# LOGIN
# =========================
@app.post("/login")
def login(data: LoginData):

    user = users_db.get(data.username)

    if not user:
        raise HTTPException(status_code=401, detail="Usuario incorrecto")

    if data.password != user["password"]:
        raise HTTPException(status_code=401, detail="Password incorrecto")

    token = create_token({
        "sub": user["username"],
        "rol": user["rol"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user["username"],
        "rol": user["rol"]
    }

# =========================
# GET PARTICIPANTES
# =========================
@app.get("/participantes")
def get_participantes(authorization: str = Header(None)):

    if authorization is None:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.split(" ")[1]
    get_current_user(token)

    db = SessionLocal()
    data = db.query(ParticipanteDB).all()

    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "email": p.email,
            "edad": p.edad,
            "pais": p.pais,
            "modalidad": p.modalidad,
            "tecnologias": p.tecnologias.split(",") if p.tecnologias else [],
            "nivel": p.nivel,
            "aceptaTerminos": p.aceptaTerminos
        }
        for p in data
    ]

# =========================
# POST PARTICIPANTES
# =========================
@app.post("/participantes")
def crear_participante(p: Participante, authorization: str = Header(None)):

    if authorization is None:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.split(" ")[1]
    get_current_user(token)

    db = SessionLocal()

    nuevo = ParticipanteDB(
        id=p.id,
        nombre=p.nombre,
        email=p.email,
        edad=p.edad,
        pais=p.pais,
        modalidad=p.modalidad,
        tecnologias=",".join(p.tecnologias),
        nivel=p.nivel,
        aceptaTerminos=p.aceptaTerminos
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return p

# =========================
# DELETE PARTICIPANTE
# =========================
@app.delete("/participantes/{id}")
def eliminar_participante(id: int, authorization: str = Header(None)):

    if authorization is None:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.split(" ")[1]
    get_current_user(token)

    db = SessionLocal()

    participante = db.query(ParticipanteDB).filter(ParticipanteDB.id == id).first()

    if not participante:
        raise HTTPException(status_code=404, detail="No existe")

    db.delete(participante)
    db.commit()

    return {"ok": True}

# =========================
# PUT PARTICIPANTE
# =========================
@app.put("/participantes/{id}")
def editar_participante(id: int, p: Participante, authorization: str = Header(None)):

    if authorization is None:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.split(" ")[1]
    get_current_user(token)

    db = SessionLocal()

    participante = db.query(ParticipanteDB).filter(ParticipanteDB.id == id).first()

    if not participante:
        raise HTTPException(status_code=404, detail="No existe")

    participante.nombre = p.nombre
    participante.email = p.email
    participante.edad = p.edad
    participante.pais = p.pais
    participante.modalidad = p.modalidad
    participante.tecnologias = ",".join(p.tecnologias)
    participante.nivel = p.nivel
    participante.aceptaTerminos = p.aceptaTerminos

    db.commit()
    db.refresh(participante)

    return p
# =========================
# MERCADO PAGO
# =========================
@app.post("/crear-preferencia")
def crear_preferencia(curso: CursoData):

    sdk = mercadopago.SDK(MP_ACCESS_TOKEN)

    preference_data = {
    "items": [
        {
            "title": curso.titulo,
            "quantity": 1,
            "currency_id": "ARS",
            "unit_price": float(curso.precio)
        }
    ],
     "back_urls": {
     "success": "https://contents-overreach-step.ngrok-free.dev/cursos?status=success",
     "failure": "https://contents-overreach-step.ngrok-free.dev/cursos?status=failure",
     "pending": "https://contents-overreach-step.ngrok-free.dev/cursos?status=pending"
 },
"auto_return": "approved"
}

    result = sdk.preference().create(preference_data)

    # 🔍 DEBUG REAL
    print("🔥 RESULTADO COMPLETO MP:")
    print(result)

    response = result.get("response", {})

    init_point = response.get("init_point")
    pref_id = response.get("id")

    # 🔴 VALIDACIÓN CLAVE (EVITA PANTALLA EN BLANCO)
    if not init_point:
        print("❌ ERROR: init_point vacío")
        return {
            "error": "No se pudo generar preferencia",
            "debug": result
        }

    return {
        "id": pref_id,
        "init_point": init_point
    }