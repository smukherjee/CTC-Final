from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.vehicle import Vehicle, VehicleCreate, VehicleUpdate
from ..services.vehicle_service import (
    get_all_vehicles, get_vehicle_by_id, create_vehicle, update_vehicle, delete_vehicle
)

router = APIRouter(prefix="/vehicle", tags=["vehicle"])


@router.get("/", response_model=List[Vehicle])
def list_vehicles():
    return get_all_vehicles()


@router.get("/{vehicle_id}", response_model=Vehicle)
def get_vehicle(vehicle_id: int):
    v = get_vehicle_by_id(vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


@router.post("/", response_model=Vehicle)
def create_new_vehicle(v: VehicleCreate):
    return create_vehicle(v)


@router.put("/{vehicle_id}", response_model=Vehicle)
def update_existing_vehicle(vehicle_id: int, v: VehicleUpdate):
    return update_vehicle(vehicle_id, v)


@router.delete("/{vehicle_id}")
def delete_existing_vehicle(vehicle_id: int):
    delete_vehicle(vehicle_id)
    return {"ok": True}
