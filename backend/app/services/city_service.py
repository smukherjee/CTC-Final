from typing import List, Optional
from ..db import SessionLocal
from ..models.city import CityModel
from ..schemas.city import CityUpdate


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
    db = SessionLocal()
    try:
        city = CityModel(**data)
        db.add(city)
        db.commit()
        db.refresh(city)
        return city
    finally:
        db.close()


def update_city(city_id: int, payload: CityUpdate) -> CityModel:
    db = SessionLocal()
    try:
        row = db.query(CityModel).filter(CityModel.id == city_id).first()
        if not row:
            raise KeyError("City not found")
        for key, value in payload.dict().items():
            if value is not None:
                setattr(row, key, value)
        db.add(row)
        db.commit()
        db.refresh(row)
        return row
    finally:
        db.close()


def delete_city(city_id: int) -> None:
    db = SessionLocal()
    try:
        db.query(CityModel).filter(CityModel.id == city_id).delete()
        db.commit()
    finally:
        db.close()
