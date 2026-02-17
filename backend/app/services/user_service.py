from typing import List, Optional
from ..schemas.user import User, UserCreate, UserUpdate
from ..models.user import UserModel
from ..db import SessionLocal


def _model_to_user(m: UserModel) -> User:
    return User(id=m.id, name=m.name, role=m.role, branch_id=m.branch_id)


def get_all_users() -> List[User]:
    db = SessionLocal()
    try:
        rows = db.query(UserModel).all()
        return [_model_to_user(r) for r in rows]
    finally:
        db.close()


def get_user_by_id(user_id: int) -> Optional[User]:
    db = SessionLocal()
    try:
        r = db.query(UserModel).filter(UserModel.id == user_id).first()
        return _model_to_user(r) if r else None
    finally:
        db.close()


def create_user(u: UserCreate) -> User:
    db = SessionLocal()
    try:
        new = UserModel(**u.dict())
        db.add(new)
        db.commit()
        db.refresh(new)
        return _model_to_user(new)
    finally:
        db.close()


def update_user(user_id: int, u: UserUpdate) -> User:
    db = SessionLocal()
    try:
        r = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not r:
            raise KeyError("User not found")
        for k, val in u.dict().items():
            if val is not None:
                setattr(r, k, val)
        db.add(r)
        db.commit()
        db.refresh(r)
        return _model_to_user(r)
    finally:
        db.close()


def delete_user(user_id: int) -> None:
    db = SessionLocal()
    try:
        db.query(UserModel).filter(UserModel.id == user_id).delete()
        db.commit()
    finally:
        db.close()
