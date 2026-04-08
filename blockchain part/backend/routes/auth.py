# backend/routes/auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import bcrypt
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import users_collection

router   = APIRouter()
security = HTTPBearer()

SECRET_KEY = "medivault-super-secret-key-123"
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

# ── Pydantic models ───────────────────────────────────────

class RegisterRequest(BaseModel):
    name:           str
    email:          str
    password:       str
    role:           str
    wallet_address: str
    specialization: Optional[str] = None

class LoginRequest(BaseModel):
    email:    str
    password: str

# ── Password utilities ────────────────────────────────────

def hash_password(password: str) -> str:
    # Truncate to 72 bytes — bcrypt hard limit
    pwd_bytes = password.encode('utf-8')[:72]
    salt      = bcrypt.gensalt()
    hashed    = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    try:
        plain_bytes  = plain.encode('utf-8')[:72]
        hashed_bytes = hashed.encode('utf-8')
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False

# ── JWT utilities ─────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire    = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ── Auth dependency ───────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token   = credentials.credentials
    payload = decode_token(token)
    email   = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account deactivated")
    return user

# ── Routes ────────────────────────────────────────────────

@router.post("/register")
async def register(body: RegisterRequest):
    valid_roles = ["admin", "doctor", "patient", "student"]
    if body.role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Must be: admin, doctor, patient, student"
        )

    if await users_collection.find_one({"email": body.email}):
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    if await users_collection.find_one(
        {"wallet_address": body.wallet_address.lower()}
    ):
        raise HTTPException(
            status_code=409,
            detail="Wallet address already registered"
        )

    user_doc = {
        "name":           body.name,
        "email":          body.email,
        "password":       hash_password(body.password),
        "role":           body.role,
        "wallet_address": body.wallet_address.lower(),
        "specialization": body.specialization,
        "is_active":      True,
        "created_at":     datetime.utcnow()
    }

    result = await users_collection.insert_one(user_doc)

    token = create_access_token({
        "sub":    body.email,
        "role":   body.role,
        "wallet": body.wallet_address.lower()
    })

    return {
        "message":      "User registered successfully",
        "access_token": token,
        "token_type":   "bearer",
        "user": {
            "id":             str(result.inserted_id),
            "name":           body.name,
            "email":          body.email,
            "role":           body.role,
            "wallet_address": body.wallet_address.lower()
        }
    }


@router.post("/login")
async def login(body: LoginRequest):
    user = await users_collection.find_one({"email": body.email})

    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account deactivated"
        )

    token = create_access_token({
        "sub":    user["email"],
        "role":   user["role"],
        "wallet": user["wallet_address"]
    })

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user": {
            "id":             str(user["_id"]),
            "name":           user["name"],
            "email":          user["email"],
            "role":           user["role"],
            "wallet_address": user["wallet_address"],
            "is_active":      user.get("is_active", True)
        }
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id":             str(current_user["_id"]),
        "name":           current_user["name"],
        "email":          current_user["email"],
        "role":           current_user["role"],
        "wallet_address": current_user["wallet_address"],
        "is_active":      current_user.get("is_active", True),
        "created_at":     str(current_user.get("created_at", ""))
    }


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
