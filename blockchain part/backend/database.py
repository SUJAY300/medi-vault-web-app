# backend/database.py
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL   = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "medivault_db")

try:
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    db     = client[DATABASE_NAME]

    users_collection      = db["users"]
    documents_collection  = db["documents"]
    audit_logs_collection = db["audit_logs"]

    print("[DB] MongoDB client created for: " + MONGODB_URL)

except Exception as e:
    print("[DB ERROR] " + str(e))
    raise