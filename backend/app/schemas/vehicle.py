from pydantic import BaseModel
from typing import Optional


class Vehicle(BaseModel):
    id: int
    number: str
    type: Optional[str] = None
    capacity: Optional[str] = None
    owner_id: Optional[int] = None
    status: Optional[str] = None


class VehicleCreate(BaseModel):
    number: str
    type: Optional[str] = None
    capacity: Optional[str] = None
    owner_id: Optional[int] = None
    status: Optional[str] = None


class VehicleUpdate(BaseModel):
    number: Optional[str] = None
    type: Optional[str] = None
    capacity: Optional[str] = None
    owner_id: Optional[int] = None
    status: Optional[str] = None
