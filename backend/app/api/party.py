from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..schemas.party import Party, PartyCreate, PartyUpdate
from ..services.party_service import (
    get_all_parties, get_party_by_id, create_party, update_party, delete_party
)

router = APIRouter(prefix="/party", tags=["party"])

@router.get("/", response_model=List[Party])
def list_parties():
    return get_all_parties()

@router.get("/{party_id}", response_model=Party)
def get_party(party_id: int):
    party = get_party_by_id(party_id)
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    return party

@router.post("/", response_model=Party)
def create_new_party(party: PartyCreate):
    return create_party(party)

@router.put("/{party_id}", response_model=Party)
def update_existing_party(party_id: int, party: PartyUpdate):
    return update_party(party_id, party)

@router.delete("/{party_id}")
def delete_existing_party(party_id: int):
    delete_party(party_id)
    return {"ok": True}
