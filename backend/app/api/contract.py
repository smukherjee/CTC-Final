from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.contract import Contract, ContractCreate, ContractUpdate
from ..services.contract_service import (
    get_all_contracts, get_contract_by_id, create_contract, update_contract, delete_contract
)

router = APIRouter(prefix="/contract", tags=["contract"])


@router.get("/", response_model=List[Contract])
def list_contracts():
    return get_all_contracts()


@router.get("/{contract_id}", response_model=Contract)
def get_contract(contract_id: int):
    c = get_contract_by_id(contract_id)
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    return c


@router.post("/", response_model=Contract)
def create_new_contract(c: ContractCreate):
    return create_contract(c)


@router.put("/{contract_id}", response_model=Contract)
def update_existing_contract(contract_id: int, c: ContractUpdate):
    return update_contract(contract_id, c)


@router.delete("/{contract_id}")
def delete_existing_contract(contract_id: int):
    delete_contract(contract_id)
    return {"ok": True}
