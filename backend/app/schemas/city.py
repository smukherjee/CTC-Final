from pydantic import BaseModel
from typing import Optional


class City(BaseModel):
    id: int
    name: str
    state: Optional[str] = None
    code: Optional[str] = None

    class Config:
        orm_mode = True


class CityCreate(BaseModel):
    name: str
    state: Optional[str] = None
    code: Optional[str] = None


class CityUpdate(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None
    code: Optional[str] = None
