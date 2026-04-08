# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "MediVault API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Load routes one by one so we can see which one fails
print("[STARTUP] Loading auth routes...")
from routes import auth
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
print("[STARTUP] Auth routes OK")

print("[STARTUP] Loading user routes...")
from routes import users
app.include_router(users.router, prefix="/api/users", tags=["Users"])
print("[STARTUP] User routes OK")

print("[STARTUP] Loading document routes...")
from routes import documents
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
print("[STARTUP] Document routes OK")

print("[STARTUP] Loading blockchain routes...")
from routes import blockchain
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["Blockchain"])
print("[STARTUP] Blockchain routes OK")

print("[STARTUP] All routes loaded successfully!")