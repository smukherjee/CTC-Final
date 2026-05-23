from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.vehicle_location import (
    VehicleLatestLocation,
    VehicleLocation,
    VehicleLocationCreate,
)
from app.services import vehicle_location_service

router = APIRouter(tags=["vehicle-location"])


@router.post("/vehicle-locations/", response_model=VehicleLocation)
def create_location_update(location: VehicleLocationCreate, db: Session = Depends(get_db)):
    """Create a new location update for a vehicle."""
    try:
        return vehicle_location_service.create_location_update(db, location)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vehicle-locations/latest", response_model=List[VehicleLatestLocation])
@router.get("/vehicle-locations/", response_model=List[VehicleLatestLocation])
def get_latest_locations(
    limit: int = 100,
    fy: str | None = Query(default=None),
    lr_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """Get the latest location for all vehicles with LR details."""
    try:
        return vehicle_location_service.get_latest_locations(db, limit=limit, fy=fy, lr_id=lr_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vehicle-locations/history/lr/{lr_id}", response_model=List[VehicleLocation])
def get_lr_history(lr_id: int, db: Session = Depends(get_db)):
    """Get location history for a specific LR."""
    try:
        history = vehicle_location_service.get_location_history_by_lr_id(db, lr_id)
        if not history:
            raise HTTPException(status_code=404, detail="No history found for this LR")
        return history
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
