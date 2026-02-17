from pydantic import BaseModel
from typing import Optional


class User(BaseModel):
    id: int
    name: str
    role: str
    branch_id: Optional[str] = None


class UserCreate(BaseModel):
    name: str
    role: str
    branch_id: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    branch_id: Optional[str] = None
