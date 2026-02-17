from typing import List, Optional
from ..db import SessionLocal
from ..models.city import CityModel


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
