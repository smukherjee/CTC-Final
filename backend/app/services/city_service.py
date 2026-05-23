from typing import List, Optional
import random
import string

from sqlalchemy.orm import Session

from ..models.city import CityModel
from ..schemas.city import CityUpdate


def _generate_random_code(length: int = 5) -> str:
    """Return a random uppercase alphanumeric string of the given length."""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(random.choices(alphabet, k=length))


def _ensure_unique_code(db: Session) -> str:
    """Produce a code that does not already exist in the cities table."""
    while True:
        candidate = _generate_random_code()
        if not db.query(CityModel).filter(CityModel.code == candidate).first():
            return candidate


def get_all_cities(db: Session) -> List[CityModel]:
    return db.query(CityModel).all()


def get_city_by_id(db: Session, city_id: int) -> Optional[CityModel]:
    return db.query(CityModel).filter(CityModel.id == city_id).first()


def create_city(db: Session, data: dict) -> CityModel:
    # if caller supplied a code (old clients, seed script, etc.), we'll
    # ignore it and generate our own unique value instead. this keeps the
    # field private and deterministic from the API's perspective.
    data.pop("code", None)
    data["code"] = _ensure_unique_code(db)

    city = CityModel(**data)
    db.add(city)
    db.commit()
    db.refresh(city)
    return city


def update_city(db: Session, city_id: int, payload: CityUpdate) -> Optional[CityModel]:
    row = db.query(CityModel).filter(CityModel.id == city_id).first()
    if not row:
        return None
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def delete_city(db: Session, city_id: int) -> bool:
    deleted = db.query(CityModel).filter(CityModel.id == city_id).delete()
    db.commit()
    return bool(deleted)
