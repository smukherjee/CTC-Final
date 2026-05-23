from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..schemas.user import User, UserCreate, UserUpdate
from ..services.user_service import (
    get_all_users, get_user_by_id, create_user, update_user, delete_user
)

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/", response_model=List[User])
def list_users(db: Session = Depends(get_db)):
    return get_all_users(db)


@router.get("/{user_id}", response_model=User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    u = get_user_by_id(db, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u


@router.post("/", response_model=User)
def create_new_user(u: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, u)


@router.put("/{user_id}", response_model=User)
def update_existing_user(user_id: int, u: UserUpdate, db: Session = Depends(get_db)):
    return update_user(db, user_id, u)


@router.delete("/{user_id}")
def delete_existing_user(user_id: int, db: Session = Depends(get_db)):
    delete_user(db, user_id)
    return {"ok": True}
