from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.city import City, CityCreate, CityUpdate
from ..services.city_service import get_all_cities, get_city_by_id, create_city, update_city, delete_city

router = APIRouter(prefix="/city", tags=["city"])


@router.get("/", response_model=List[City])
def list_cities():
    return get_all_cities()


@router.get("/{city_id}", response_model=City)
def get_city(city_id: int):
    city = get_city_by_id(city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.post("/", response_model=City)
def create_new_city(payload: CityCreate):
    return create_city(payload.dict())


@router.put("/{city_id}", response_model=City)
def update_existing_city(city_id: int, payload: CityUpdate):
    city = update_city(city_id, payload)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.delete("/{city_id}")
def delete_existing_city(city_id: int):
    deleted = delete_city(city_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="City not found")
    return {"ok": True}
