from typing import List, Optional
from sqlalchemy import desc
from db.db import SessionLocal
from app.models.vehicle_location import VehicleLocationModel
from app.models.lr import LRModel
from app.schemas.vehicle_location import VehicleLocationCreate, VehicleLatestLocation


def create_location_update(location_data: VehicleLocationCreate) -> VehicleLocationModel:
    """Create a new location update."""
    db = SessionLocal()
    try:
        db_location = VehicleLocationModel(**location_data.model_dump())
        db.add(db_location)
        db.commit()
        db.refresh(db_location)
        return db_location
    finally:
        db.close()


def get_location_history(vehicle_number: str) -> List[VehicleLocationModel]:
    """Get all location updates for a vehicle, ordered by most recent."""
    db = SessionLocal()
    try:
        return db.query(VehicleLocationModel)\
            .filter(VehicleLocationModel.vehicle_number == vehicle_number)\
            .order_by(desc(VehicleLocationModel.reported_at))\
            .all()
    finally:
        db.close()


def get_latest_locations(limit: Optional[int] = None) -> List[VehicleLatestLocation]:
    """
    Get the latest location for each active vehicle.
    Joins with LR table to get trip details.
    """
    db = SessionLocal()
    try:
        # Subquery to get latest location per vehicle
        from sqlalchemy import func
        from sqlalchemy.orm import aliased
        
        # We need to map LRs to their latest location.
        # But vehicles are tied to LRs via vehicle_number or lr_id?
        # The schema and previous logic linked via vehicle_number.
        # Let's stick to vehicle_number as the primary link.
        
        # 1. Get the latest reported_at for each vehicle
        subq = db.query(
            VehicleLocationModel.vehicle_number,
            func.max(VehicleLocationModel.reported_at).label('max_reported_at')
        ).group_by(VehicleLocationModel.vehicle_number).subquery()
        
        # 2. Get the full location record for that max time
        LatestLoc = aliased(VehicleLocationModel)
        latest_loc_q = db.query(LatestLoc).join(
            subq,
            (LatestLoc.vehicle_number == subq.c.vehicle_number) &
            (LatestLoc.reported_at == subq.c.max_reported_at)
        ).subquery()
        
        LatestLocAlias = aliased(VehicleLocationModel, latest_loc_q)

        # 3. Query Active LRs and Left Join with Latest Location
        # Active LRs = Status not in ['DELIVERED', 'CANCELLED'] (assuming standard statuses)
        # Or just show all? 'DELIVERED' might be useful for a bit. 
        # Let's filter out 'CANCELLED'. 'DELIVERED' might be relevant for history.
        # But user wants "Tracking", usually implies active. 
        # If I show 'DELIVERED', the list grows forever.
        # Let's filter != 'CANCELLED' for now, or maybe only 'IN_TRANSIT', 'GENERATED'?
        # Let's match the Dispatch Register: it usually shows everything.
        # But for "Tracking", likely only active. 
        # Let's exclude 'DELIVERED' and 'CANCELLED' to keep the list relevant.
        
        query = db.query(LRModel, LatestLocAlias)\
            .outerjoin(LatestLocAlias, LRModel.vehicle_number == LatestLocAlias.vehicle_number)\
            .filter(LRModel.status.notin_(['DELIVERED', 'CANCELLED']))\
            .order_by(desc(LRModel.date))
        
        if limit:
            query = query.limit(limit)
        
        results = []
        for lr, loc in query.all():
            if not lr.vehicle_number:
                continue # Skip LRs without vehicle numbers
                
            results.append(VehicleLatestLocation(
                lr_id=lr.id,
                lr_number=lr.lr_number,
                vehicle_number=lr.vehicle_number,
                origin=lr.origin,
                destination=lr.destination,
                location=loc.location if loc else "Pending",
                reported_at=loc.reported_at if loc else None,
                date=str(lr.date) if lr.date else None
            ))
        
        return results
    finally:
        db.close()
