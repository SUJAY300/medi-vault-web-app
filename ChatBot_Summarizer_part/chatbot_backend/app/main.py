from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from chatbot_backend.app.routes import query



app = FastAPI(
    title="Patient Query Chatbot API",
    version="0.1.0"
)

app.include_router(query.router)


@app.get("/")
def root():
    return {"status": "Chatbot backend running"}

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)