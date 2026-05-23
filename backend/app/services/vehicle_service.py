from typing import List, Optional

from sqlalchemy.orm import Session

from ..schemas.vehicle import Vehicle, VehicleCreate, VehicleUpdate
from ..models.vehicle import VehicleModel


def _model_to_vehicle(m: VehicleModel) -> Vehicle:
    return Vehicle(
        id=m.id,
        number=m.number,
        type=m.type,
        capacity=m.capacity,
        owner_id=m.owner_id,
        status=m.status,
    )


def get_all_vehicles(db: Session) -> List[Vehicle]:
    rows = db.query(VehicleModel).all()
    return [_model_to_vehicle(r) for r in rows]


def get_vehicle_by_id(db: Session, vehicle_id: int) -> Optional[Vehicle]:
    r = db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()
    return _model_to_vehicle(r) if r else None


def create_vehicle(db: Session, v: VehicleCreate) -> Vehicle:
    new = VehicleModel(**v.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    return _model_to_vehicle(new)


def update_vehicle(db: Session, vehicle_id: int, v: VehicleUpdate) -> Vehicle:
    r = db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()
    if not r:
        raise KeyError("Vehicle not found")
    for k, val in v.model_dump(exclude_unset=True).items():
        setattr(r, k, val)
    db.add(r)
    db.commit()
    db.refresh(r)
    return _model_to_vehicle(r)


def delete_vehicle(db: Session, vehicle_id: int) -> None:
    db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).delete()
    db.commit()
