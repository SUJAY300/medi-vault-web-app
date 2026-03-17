import sys
from pathlib import Path
from dotenv import load_dotenv

# Add project root to PYTHONPATH
ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR))
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI
from app.routes.medical import router as medical_router

app = FastAPI(title="MediVault Backend")

app.include_router(medical_router)


@app.get("/")
def health():
    return {"status": "ok"}
