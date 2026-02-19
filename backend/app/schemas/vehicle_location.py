from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class VehicleLocationBase(BaseModel):
    lr_id: Optional[int] = None
    vehicle_number: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    reported_by: Optional[str] = None
    notes: Optional[str] = None


class VehicleLocationCreate(VehicleLocationBase):
    pass


class VehicleLocationUpdate(BaseModel):
    location: Optional[str] = None
    notes: Optional[str] = None


class VehicleLocation(VehicleLocationBase):
    id: int
    reported_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# Response model for latest locations (aggregated view)
class VehicleLatestLocation(BaseModel):
    lr_id: Optional[int]
    lr_number: Optional[str]
    vehicle_number: str
    origin: Optional[str]
    destination: Optional[str]
    location: Optional[str]
    reported_at: Optional[datetime]
    date: Optional[str]  # LR date
