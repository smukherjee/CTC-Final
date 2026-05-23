from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..schemas.city import City, CityCreate, CityUpdate
from ..services.city_service import get_all_cities, get_city_by_id, create_city, update_city, delete_city

router = APIRouter(prefix="/city", tags=["city"])


@router.get("/", response_model=List[City])
def list_cities(db: Session = Depends(get_db)):
    return get_all_cities(db)


@router.get("/{city_id}", response_model=City)
def get_city(city_id: int, db: Session = Depends(get_db)):
    city = get_city_by_id(db, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.post("/", response_model=City)
def create_new_city(payload: CityCreate, db: Session = Depends(get_db)):
    return create_city(db, payload.model_dump())


@router.put("/{city_id}", response_model=City)
def update_existing_city(city_id: int, payload: CityUpdate, db: Session = Depends(get_db)):
    city = update_city(db, city_id, payload)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.delete("/{city_id}")
def delete_existing_city(city_id: int, db: Session = Depends(get_db)):
    deleted = delete_city(db, city_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="City not found")
    return {"ok": True}
