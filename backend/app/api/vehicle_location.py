from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.vehicle_location import (
    VehicleLocation,
    VehicleLocationCreate,
    VehicleLatestLocation
)
from app.services import vehicle_location_service

router = APIRouter(prefix="/vehicle-location", tags=["vehicle-location"])


@router.post("/", response_model=VehicleLocation)
def create_location_update(location: VehicleLocationCreate):
    """Create a new location update for a vehicle."""
    try:
        return vehicle_location_service.create_location_update(location)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/latest", response_model=List[VehicleLatestLocation])
def get_latest_locations(limit: int = 100):
    """Get the latest location for all vehicles with LR details."""
    try:
        return vehicle_location_service.get_latest_locations(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/lr/{lr_id}", response_model=List[VehicleLocation])
def get_lr_history(lr_id: int):
    """Get location history for a specific LR."""
    try:
        history = vehicle_location_service.get_location_history_by_lr_id(lr_id)
        if not history:
            raise HTTPException(status_code=404, detail="No history found for this LR")
        return history
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
