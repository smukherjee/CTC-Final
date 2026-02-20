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


def get_location_history_by_lr_id(lr_id: int) -> List[VehicleLocationModel]:
    """Get all location updates for a LR, ordered by most recent."""
    db = SessionLocal()
    try:
        return (
            db.query(VehicleLocationModel)
            .filter(VehicleLocationModel.lr_id == lr_id)
            .order_by(desc(VehicleLocationModel.reported_at), desc(VehicleLocationModel.id))
            .all()
        )
    finally:
        db.close()


def get_latest_locations(limit: Optional[int] = None) -> List[VehicleLatestLocation]:
    """
    Get the latest location for each active LR.
    Joins with LR table to get trip details.
    """
    db = SessionLocal()
    try:
        from sqlalchemy import func
        from sqlalchemy.orm import aliased

        # Latest timestamp per LR.
        latest_ts_subq = (
            db.query(
                VehicleLocationModel.lr_id.label('lr_id'),
                func.max(VehicleLocationModel.reported_at).label('max_reported_at'),
            )
            .filter(VehicleLocationModel.lr_id.isnot(None))
            .group_by(VehicleLocationModel.lr_id)
            .subquery()
        )

        # Deterministic tie-breaker: if same timestamp exists, keep highest id only.
        latest_id_subq = (
            db.query(
                VehicleLocationModel.lr_id.label('lr_id'),
                func.max(VehicleLocationModel.id).label('max_id'),
            )
            .join(
                latest_ts_subq,
                (VehicleLocationModel.lr_id == latest_ts_subq.c.lr_id)
                & (VehicleLocationModel.reported_at == latest_ts_subq.c.max_reported_at),
            )
            .group_by(VehicleLocationModel.lr_id)
            .subquery()
        )

        LatestLocAlias = aliased(VehicleLocationModel)

        query = (
            db.query(LRModel, LatestLocAlias)
            .outerjoin(latest_id_subq, LRModel.id == latest_id_subq.c.lr_id)
            .outerjoin(LatestLocAlias, LatestLocAlias.id == latest_id_subq.c.max_id)
            .filter(LRModel.status.notin_(['DELIVERED', 'CANCELLED']))
            .order_by(desc(LRModel.date), desc(LRModel.id))
        )

        if limit:
            query = query.limit(limit)

        results = []
        for lr, loc in query.all():
            if not lr.vehicle_number:
                continue

            results.append(VehicleLatestLocation(
                lr_id=lr.id,
                lr_number=lr.lr_number,
                vehicle_number=lr.vehicle_number,
                origin=lr.origin,
                destination=lr.destination,
                location=loc.location if loc else "Pending",
                status=loc.status if loc and loc.status else "IN_TRANSIT",
                reported_at=loc.reported_at if loc else None,
                date=str(lr.date) if lr.date else None
            ))
        
        return results
    finally:
        db.close()
