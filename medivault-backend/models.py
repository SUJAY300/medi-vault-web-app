from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    Admin = "Admin"
    Doctor = "Doctor"
    Nurse = "Nurse"
    Student = "Student"
    Patient = "Patient"

class User(BaseModel):
    email: EmailStr
    password: Optional[str] = None
    role: UserRole
    wallet_address: Optional[str] = None
    full_name: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Document(BaseModel):
    ipfs_hash: str
    file_name: str
    file_size: int
    content_type: str
    uploader_id: str
    uploader_wallet: str
    patient_address: str
    blockchain_tx_hash: str
    created_at: datetime

class DocumentResponse(BaseModel):
    ipfs_hash: str
    file_name: str
    uploader: str
    patient_address: str
    timestamp: int
    content_type: Optional[str] = None
    file_size: Optional[int] = None
    blockchain_tx_hash: Optional[str] = None
