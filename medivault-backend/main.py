from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from typing import Optional, List
from datetime import datetime
import web3
from web3 import Web3

from models import User, Document, UserRole
from auth import get_current_user, create_access_token, verify_password, get_password_hash
from ipfs_service import IPFSService
from blockchain_service import BlockchainService

load_dotenv()

app = FastAPI(title="MediVault API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "medivault")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Initialize services
ipfs_service = IPFSService()
blockchain_service = BlockchainService()

# Security
security = HTTPBearer()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await ipfs_service.initialize()
    await blockchain_service.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    client.close()

@app.get("/")
async def root():
    return {"message": "MediVault API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Authentication endpoints
@app.post("/api/auth/register")
async def register(user_data: User):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Check if wallet address already exists
    if user_data.wallet_address:
        existing_wallet = await db.users.find_one({"wallet_address": user_data.wallet_address})
        if existing_wallet:
            raise HTTPException(status_code=400, detail="Wallet address already registered")
    
    # Hash password if provided
    hashed_password = None
    if user_data.password:
        hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_dict = user_data.dict()
    user_dict["password_hash"] = hashed_password
    user_dict.pop("password", None)
    
    result = await db.users.insert_one(user_dict)
    
    # Register user on blockchain if wallet address provided
    if user_data.wallet_address:
        try:
            await blockchain_service.register_user(
                user_data.wallet_address,
                user_data.role.value
            )
        except Exception as e:
            # Log error but don't fail registration
            print(f"Blockchain registration failed: {e}")
    
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}

@app.post("/api/auth/login")
async def login(credentials: dict):
    """Login and get access token"""
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(password, user.get("password_hash")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(user["_id"]), "email": email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "wallet_address": user.get("wallet_address")
        }
    }

# User management endpoints
@app.get("/api/users/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.get("/api/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    """Get all users (Admin only)"""
    if current_user["role"] != UserRole.Admin.value:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"password_hash": 0}).to_list(length=100)
    return {"users": users}

# Document endpoints
@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    patient_address: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Upload a document to IPFS and record on blockchain"""
    user_role = current_user["role"]
    
    # Check permissions
    if user_role not in [UserRole.Admin.value, UserRole.Doctor.value, UserRole.Nurse.value]:
        raise HTTPException(status_code=403, detail="Only Admin, Doctor, or Nurse can upload documents")
    
    # For Admin, Doctor, Nurse - patient_address is required
    if user_role != UserRole.Admin.value and not patient_address:
        raise HTTPException(status_code=400, detail="Patient address required")
    
    # Read file content
    file_content = await file.read()
    
    # Upload to IPFS
    try:
        ipfs_hash = await ipfs_service.upload_file(file_content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IPFS upload failed: {str(e)}")
    
    # Get wallet address from current user
    wallet_address = current_user.get("wallet_address")
    if not wallet_address:
        raise HTTPException(status_code=400, detail="Wallet address not linked to account")
    
    # Record on blockchain
    try:
        tx_hash = await blockchain_service.upload_document(
            wallet_address,
            ipfs_hash,
            file.filename,
            patient_address or wallet_address  # If admin uploading for self, use own address
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain transaction failed: {str(e)}")
    
    # Store metadata in MongoDB
    document = {
        "ipfs_hash": ipfs_hash,
        "file_name": file.filename,
        "file_size": len(file_content),
        "content_type": file.content_type,
        "uploader_id": current_user["id"],
        "uploader_wallet": wallet_address,
        "patient_address": patient_address or wallet_address,
        "blockchain_tx_hash": tx_hash,
        "created_at": datetime.utcnow()
    }
    
    result = await db.documents.insert_one(document)
    
    return {
        "message": "Document uploaded successfully",
        "document_id": str(result.inserted_id),
        "ipfs_hash": ipfs_hash,
        "blockchain_tx_hash": tx_hash
    }

@app.get("/api/documents")
async def get_documents(
    patient_address: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get documents based on user role"""
    user_role = current_user["role"]
    wallet_address = current_user.get("wallet_address")
    
    # Patients can only view their own documents
    if user_role == UserRole.Patient.value:
        if not wallet_address:
            raise HTTPException(status_code=400, detail="Wallet address not linked")
        patient_address = wallet_address
    
    # Admin, Doctor, Nurse, Student can view patient documents
    elif user_role in [UserRole.Admin.value, UserRole.Doctor.value, UserRole.Nurse.value, UserRole.Student.value]:
        if not patient_address:
            raise HTTPException(status_code=400, detail="Patient address required")
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Get documents from blockchain
    try:
        blockchain_docs = await blockchain_service.get_patient_documents(patient_address)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch from blockchain: {str(e)}")
    
    # Get additional metadata from MongoDB
    documents = []
    for doc in blockchain_docs:
        mongo_doc = await db.documents.find_one({"ipfs_hash": doc["ipfsHash"]})
        if mongo_doc:
            documents.append({
                "ipfs_hash": doc["ipfsHash"],
                "file_name": doc["fileName"],
                "uploader": doc["uploader"],
                "patient_address": doc["patientAddress"],
                "timestamp": doc["timestamp"],
                "content_type": mongo_doc.get("content_type"),
                "file_size": mongo_doc.get("file_size"),
                "blockchain_tx_hash": mongo_doc.get("blockchain_tx_hash")
            })
    
    return {"documents": documents}

@app.get("/api/documents/{ipfs_hash}/download")
async def download_document(
    ipfs_hash: str,
    current_user: dict = Depends(get_current_user)
):
    """Download a document from IPFS"""
    # Verify user has access to this document
    # Get document from MongoDB to check permissions
    doc = await db.documents.find_one({"ipfs_hash": ipfs_hash})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    user_role = current_user["role"]
    wallet_address = current_user.get("wallet_address")
    
    # Check permissions
    if user_role == UserRole.Patient.value:
        if doc["patient_address"] != wallet_address:
            raise HTTPException(status_code=403, detail="Access denied")
    elif user_role == UserRole.Student.value:
        # Students can download for case studies
        pass
    elif user_role not in [UserRole.Admin.value, UserRole.Doctor.value, UserRole.Nurse.value]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Download from IPFS
    try:
        file_content = await ipfs_service.get_file(ipfs_hash)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download from IPFS: {str(e)}")
    
    from fastapi.responses import Response
    return Response(
        content=file_content,
        media_type=doc.get("content_type", "application/octet-stream"),
        headers={"Content-Disposition": f'attachment; filename="{doc["file_name"]}"'}
    )

@app.delete("/api/documents/{ipfs_hash}")
async def delete_document(
    ipfs_hash: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a document (Admin only)"""
    if current_user["role"] != UserRole.Admin.value:
        raise HTTPException(status_code=403, detail="Only Admin can delete documents")
    
    # Get document info
    doc = await db.documents.find_one({"ipfs_hash": ipfs_hash})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    wallet_address = current_user.get("wallet_address")
    if not wallet_address:
        raise HTTPException(status_code=400, detail="Wallet address not linked")
    
    # Delete on blockchain
    try:
        tx_hash = await blockchain_service.delete_document(
            wallet_address,
            doc["patient_address"],
            ipfs_hash
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain deletion failed: {str(e)}")
    
    # Mark as deleted in MongoDB
    await db.documents.update_one(
        {"ipfs_hash": ipfs_hash},
        {"$set": {"deleted": True, "deleted_at": datetime.utcnow(), "deleted_by": current_user["id"]}}
    )
    
    return {"message": "Document deleted successfully", "blockchain_tx_hash": tx_hash}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
