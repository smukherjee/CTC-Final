from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..schemas.vehicle import Vehicle, VehicleCreate, VehicleUpdate
from ..services.vehicle_service import (
    get_all_vehicles, get_vehicle_by_id, create_vehicle, update_vehicle, delete_vehicle
)

router = APIRouter(prefix="/vehicle", tags=["vehicle"])


@router.get("/", response_model=List[Vehicle])
def list_vehicles(db: Session = Depends(get_db)):
    return get_all_vehicles(db)


@router.get("/{vehicle_id}", response_model=Vehicle)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    v = get_vehicle_by_id(db, vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


@router.post("/", response_model=Vehicle)
def create_new_vehicle(v: VehicleCreate, db: Session = Depends(get_db)):
    return create_vehicle(db, v)


@router.put("/{vehicle_id}", response_model=Vehicle)
def update_existing_vehicle(vehicle_id: int, v: VehicleUpdate, db: Session = Depends(get_db)):
    return update_vehicle(db, vehicle_id, v)


@router.delete("/{vehicle_id}")
def delete_existing_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    delete_vehicle(db, vehicle_id)
    return {"ok": True}
