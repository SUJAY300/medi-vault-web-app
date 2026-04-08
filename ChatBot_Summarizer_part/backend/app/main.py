import sys
from pathlib import Path
from dotenv import load_dotenv
import os

# Add project root to PYTHONPATH
ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR))
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.medical import router as medical_router

app = FastAPI(title="MediVault Backend")

app.include_router(medical_router)

# Enable CORS so your MERN frontend can call this API.
# Configure via ALLOWED_ORIGINS (comma-separated), e.g.
# ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
allowed_origins_raw = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
)
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "ok"}
