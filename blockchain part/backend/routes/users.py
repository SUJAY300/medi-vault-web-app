# backend/routes/users.py
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import users_collection
from routes.auth import get_current_user

router = APIRouter()


@router.get("/all", summary="Get all users - Admin only")
async def get_all_users(
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    cursor = users_collection.find(
        {},
        {
            "_id": 1,
            "name": 1,
            "email": 1,
            "role": 1,
            "wallet_address": 1,
            "is_active": 1,
            "created_at": 1
        }
    )

    users = []
    async for user in cursor:
        user["id"] = str(user.pop("_id"))
        if user.get("created_at"):
            user["created_at"] = user["created_at"].isoformat()
        users.append(user)

    return {"users": users, "total": len(users)}


@router.get("/{wallet_address}", summary="Get user by wallet address")
async def get_user_by_wallet(
    wallet_address: str,
    current_user: dict = Depends(get_current_user)
):
    user = await users_collection.find_one(
        {"wallet_address": wallet_address.lower()},
        {"password": 0}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user["id"] = str(user.pop("_id"))
    if user.get("created_at"):
        user["created_at"] = user["created_at"].isoformat()

    return user


@router.put("/deactivate/{wallet_address}", summary="Deactivate user - Admin only")
async def deactivate_user(
    wallet_address: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    result = await users_collection.update_one(
        {"wallet_address": wallet_address.lower()},
        {
            "$set": {
                "is_active": False,
                "deactivated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {"message": "User deactivated successfully"}