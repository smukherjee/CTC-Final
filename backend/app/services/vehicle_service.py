from typing import List, Optional
from ..schemas.vehicle import Vehicle, VehicleCreate, VehicleUpdate
from ..models.vehicle import VehicleModel
from ..db import SessionLocal


def _model_to_vehicle(m: VehicleModel) -> Vehicle:
    return Vehicle(
        id=m.id,
        number=m.number,
        type=m.type,
        capacity=m.capacity,
        owner_id=m.owner_id,
        status=m.status,
    )


def get_all_vehicles() -> List[Vehicle]:
    db = SessionLocal()
    try:
        rows = db.query(VehicleModel).all()
        return [_model_to_vehicle(r) for r in rows]
    finally:
        db.close()


def get_vehicle_by_id(vehicle_id: int) -> Optional[Vehicle]:
    db = SessionLocal()
    try:
        r = db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()
        return _model_to_vehicle(r) if r else None
    finally:
        db.close()


def create_vehicle(v: VehicleCreate) -> Vehicle:
    db = SessionLocal()
    try:
        new = VehicleModel(**v.dict())
        db.add(new)
        db.commit()
        db.refresh(new)
        return _model_to_vehicle(new)
    finally:
        db.close()


def update_vehicle(vehicle_id: int, v: VehicleUpdate) -> Vehicle:
    db = SessionLocal()
    try:
        r = db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()
        if not r:
            raise KeyError("Vehicle not found")
        for k, val in v.dict().items():
            if val is not None:
                setattr(r, k, val)
        db.add(r)
        db.commit()
        db.refresh(r)
        return _model_to_vehicle(r)
    finally:
        db.close()


def delete_vehicle(vehicle_id: int) -> None:
    db = SessionLocal()
    try:
        db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).delete()
        db.commit()
    finally:
        db.close()
