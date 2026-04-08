# backend/routes/documents.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from datetime import datetime
from typing import Optional
import httpx
import json
import os
import sys
import hashlib

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import documents_collection, audit_logs_collection
from routes.auth import get_current_user

router = APIRouter()

PINATA_API_KEY    = os.getenv("PINATA_API_KEY", "")
PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY", "")
PINATA_BASE_URL   = "https://api.pinata.cloud"
IPFS_GATEWAY      = os.getenv("IPFS_GATEWAY", "https://gateway.pinata.cloud/ipfs/")


async def upload_to_pinata(file_bytes: bytes, file_name: str, metadata: dict) -> str:
    if not PINATA_API_KEY or PINATA_API_KEY == "your_pinata_api_key_here":
        mock_hash = "Qm" + hashlib.sha256(file_bytes).hexdigest()[:44]
        print("[MOCK IPFS] Hash: " + mock_hash)
        return mock_hash

    url = PINATA_BASE_URL + "/pinning/pinFileToIPFS"
    pin_metadata = {
        "name": file_name,
        "keyvalues": {
            "documentType": metadata.get("document_type", "unknown"),
            "patientWallet": metadata.get("patient_wallet", ""),
            "uploadedAt": datetime.utcnow().isoformat()
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers={
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_SECRET_KEY
            },
            files={
                "file": (file_name, file_bytes, "application/octet-stream"),
                "pinataMetadata": (None, json.dumps(pin_metadata), "application/json")
            },
            timeout=60.0
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail="Pinata upload failed: " + response.text
        )

    return response.json()["IpfsHash"]


@router.post("/upload", summary="Upload document to IPFS")
async def upload_document(
    file: UploadFile = File(...),
    patient_wallet: str = Form(...),
    document_type: str = Form(...),
    description: str = Form(""),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["doctor", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only doctors and admins can upload documents"
        )

    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: PDF, JPEG, PNG"
        )

    valid_doc_types = ["prescription", "lab_report", "imaging", "history", "other"]
    if document_type not in valid_doc_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid document type"
        )

    file_bytes = await file.read()

    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum 50MB."
        )

    metadata = {
        "document_type": document_type,
        "patient_wallet": patient_wallet.lower(),
        "uploaded_by": current_user["wallet_address"]
    }

    ipfs_hash = await upload_to_pinata(file_bytes, file.filename, metadata)
    ipfs_url  = IPFS_GATEWAY + ipfs_hash

    doc = {
        "ipfs_hash":      ipfs_hash,
        "file_name":      file.filename,
        "file_size":      len(file_bytes),
        "content_type":   file.content_type,
        "document_type":  document_type,
        "description":    description,
        "patient_wallet": patient_wallet.lower(),
        "uploaded_by":    current_user["wallet_address"],
        "uploader_name":  current_user["name"],
        "uploaded_at":    datetime.utcnow(),
        "is_verified":    False,
        "blockchain_tx":  None,
        "ipfs_url":       ipfs_url,
        "status":         "pending_blockchain"
    }

    result = await documents_collection.insert_one(doc)

    await audit_logs_collection.insert_one({
        "action":         "DOCUMENT_UPLOADED_TO_IPFS",
        "ipfs_hash":      ipfs_hash,
        "file_name":      file.filename,
        "patient_wallet": patient_wallet.lower(),
        "actor":          current_user["wallet_address"],
        "timestamp":      datetime.utcnow()
    })

    return {
        "message":       "Document uploaded to IPFS successfully",
        "ipfs_hash":     ipfs_hash,
        "ipfs_url":      ipfs_url,
        "file_name":     file.filename,
        "document_type": document_type,
        "document_id":   str(result.inserted_id)
    }


@router.post("/confirm-blockchain", summary="Confirm blockchain storage")
async def confirm_blockchain(
    ipfs_hash: str,
    tx_hash: str,
    patient_wallet: str,
    current_user: dict = Depends(get_current_user)
):
    result = await documents_collection.update_one(
        {"ipfs_hash": ipfs_hash},
        {
            "$set": {
                "blockchain_tx": tx_hash,
                "is_verified":   True,
                "status":        "blockchain_confirmed",
                "confirmed_at":  datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "message":     "Document confirmed on blockchain",
        "ipfs_hash":   ipfs_hash,
        "tx_hash":     tx_hash,
        "is_verified": True
    }


@router.get("/patient/{wallet_address}", summary="Get patient documents")
async def get_patient_documents(
    wallet_address: str,
    current_user: dict = Depends(get_current_user)
):
    cursor = documents_collection.find(
        {"patient_wallet": wallet_address.lower()},
        {
            "_id": 1, "ipfs_hash": 1, "file_name": 1,
            "document_type": 1, "uploaded_by": 1, "uploader_name": 1,
            "uploaded_at": 1, "is_verified": 1,
            "blockchain_tx": 1, "ipfs_url": 1, "status": 1
        }
    ).sort("uploaded_at", -1)

    docs = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        if doc.get("uploaded_at"):
            doc["uploaded_at"] = doc["uploaded_at"].isoformat()
        docs.append(doc)

    return {"documents": docs, "total": len(docs)}


@router.get("/verify/{ipfs_hash}", summary="Verify document")
async def verify_document_db(ipfs_hash: str):
    doc = await documents_collection.find_one({"ipfs_hash": ipfs_hash})

    if not doc:
        return {"is_verified": False, "message": "Document not found"}

    return {
        "is_verified":    doc.get("is_verified", False),
        "file_name":      doc.get("file_name"),
        "document_type":  doc.get("document_type"),
        "patient_wallet": doc.get("patient_wallet"),
        "uploaded_at":    str(doc.get("uploaded_at", "")),
        "blockchain_tx":  doc.get("blockchain_tx"),
        "ipfs_url":       doc.get("ipfs_url")
    }


@router.get("/all", summary="Get all documents - Admin only")
async def get_all_documents(
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    cursor = documents_collection.find(
        {},
        {
            "_id": 1, "ipfs_hash": 1, "file_name": 1,
            "document_type": 1, "patient_wallet": 1,
            "uploader_name": 1, "uploaded_at": 1,
            "is_verified": 1, "status": 1
        }
    ).sort("uploaded_at", -1)

    docs = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        if doc.get("uploaded_at"):
            doc["uploaded_at"] = doc["uploaded_at"].isoformat()
        docs.append(doc)

    return {"documents": docs, "total": len(docs)}