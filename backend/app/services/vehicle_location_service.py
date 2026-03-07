from datetime import datetime
from typing import List, Optional
from sqlalchemy import desc
from app.db import SessionLocal
from app.models.vehicle_location import VehicleLocationModel
from app.models.lr import LRModel
from app.schemas.vehicle_location import VehicleLocationCreate, VehicleLatestLocation


def create_location_update(location_data: VehicleLocationCreate) -> VehicleLocationModel:
    """Create a new location update."""
    db = SessionLocal()
    try:
        payload = location_data.model_dump()

        lr_id = payload.get("lr_id")
        lr = None
        if lr_id:
            lr = db.query(LRModel).filter(LRModel.id == lr_id).first()
            if not lr:
                raise ValueError("LR not found")

        vehicle_number = (payload.get("vehicle_number") or "").strip()
        if not vehicle_number and lr:
            vehicle_number = (lr.vehicle_number or "").strip()
        if not vehicle_number:
            raise ValueError("vehicle_number is required")

        reported_at = payload.get("timestamp")
        if reported_at is not None and not isinstance(reported_at, datetime):
            raise ValueError("timestamp must be a valid datetime")

        db_location = VehicleLocationModel(
            lr_id=lr_id,
            vehicle_number=vehicle_number,
            location=(payload.get("location") or "").strip(),
            status=payload.get("status"),
            reported_by=payload.get("reported_by"),
            notes=payload.get("notes"),
            reported_at=reported_at or None,
        )
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


def get_latest_locations(
    limit: Optional[int] = None,
    fy: Optional[str] = None,
    lr_id: Optional[int] = None,
) -> List[VehicleLatestLocation]:
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
        if lr_id:
            query = query.filter(LRModel.id == lr_id)
        if fy:
            query = query.filter(LRModel.financial_year == fy)

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
