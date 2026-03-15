from typing import List, Optional

from sqlalchemy.orm import Session

from ..schemas.user import User, UserCreate, UserUpdate
from ..models.user import UserModel


def _model_to_user(m: UserModel) -> User:
    return User(id=m.id, name=m.name, role=m.role, branch_id=m.branch_id)


def get_all_users(db: Session) -> List[User]:
    rows = db.query(UserModel).all()
    return [_model_to_user(r) for r in rows]


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    r = db.query(UserModel).filter(UserModel.id == user_id).first()
    return _model_to_user(r) if r else None


def create_user(db: Session, u: UserCreate) -> User:
    new = UserModel(**u.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    return _model_to_user(new)


def update_user(db: Session, user_id: int, u: UserUpdate) -> User:
    r = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not r:
        raise KeyError("User not found")
    for k, val in u.model_dump(exclude_unset=True).items():
        setattr(r, k, val)
    db.add(r)
    db.commit()
    db.refresh(r)
    return _model_to_user(r)


def delete_user(db: Session, user_id: int) -> None:
    db.query(UserModel).filter(UserModel.id == user_id).delete()
    db.commit()
