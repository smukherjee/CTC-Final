from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.user import User, UserCreate, UserUpdate
from ..services.user_service import (
    get_all_users, get_user_by_id, create_user, update_user, delete_user
)

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/", response_model=List[User])
def list_users():
    return get_all_users()


@router.get("/{user_id}", response_model=User)
def get_user(user_id: int):
    u = get_user_by_id(user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u


@router.post("/", response_model=User)
def create_new_user(u: UserCreate):
    return create_user(u)


@router.put("/{user_id}", response_model=User)
def update_existing_user(user_id: int, u: UserUpdate):
    return update_user(user_id, u)


@router.delete("/{user_id}")
def delete_existing_user(user_id: int):
    delete_user(user_id)
    return {"ok": True}
