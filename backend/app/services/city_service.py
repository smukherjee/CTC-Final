from typing import List, Optional
import random
import string
from ..db import SessionLocal
from ..models.city import CityModel
from ..schemas.city import CityUpdate


def _generate_random_code(length: int = 5) -> str:
    """Return a random uppercase alphanumeric string of the given length."""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(random.choices(alphabet, k=length))


def _ensure_unique_code(db) -> str:
    """Produce a code that does not already exist in the cities table."""
    while True:
        candidate = _generate_random_code()
        if not db.query(CityModel).filter(CityModel.code == candidate).first():
            return candidate


def get_all_cities() -> List[CityModel]:
    db = SessionLocal()
    try:
        return db.query(CityModel).all()
    finally:
        db.close()


def get_city_by_id(city_id: int) -> Optional[CityModel]:
    db = SessionLocal()
    try:
        return db.query(CityModel).filter(CityModel.id == city_id).first()
    finally:
        db.close()


def create_city(data: dict) -> CityModel:
    # hide the logic of code generation from callers; they should not
    # pass `code`.
    db = SessionLocal()
    try:
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
    finally:
        db.close()


def update_city(city_id: int, payload: CityUpdate) -> Optional[CityModel]:
    db = SessionLocal()
    try:
        row = db.query(CityModel).filter(CityModel.id == city_id).first()
        if not row:
            return None
        for key, value in payload.dict().items():
            if value is not None:
                setattr(row, key, value)
        db.add(row)
        db.commit()
        db.refresh(row)
        return row
    finally:
        db.close()


def delete_city(city_id: int) -> bool:
    db = SessionLocal()
    try:
        deleted = db.query(CityModel).filter(CityModel.id == city_id).delete()
        db.commit()
        return bool(deleted)
    finally:
        db.close()
