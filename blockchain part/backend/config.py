# backend/config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    SECRET_KEY: str = "medivault-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "medivault_db"

    # Blockchain
    GANACHE_URL: str = "http://127.0.0.1:7545"
    CONTRACT_ADDRESS: str = ""

    # IPFS / Pinata
    PINATA_API_KEY: str = ""
    PINATA_SECRET_KEY: str = ""
    IPFS_GATEWAY: str = "https://gateway.pinata.cloud/ipfs/"

    class Config:
        env_file = ".env"

settings = Settings()