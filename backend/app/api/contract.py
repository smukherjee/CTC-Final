from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.contract import Contract, ContractCreate, ContractUpdate
from ..services.contract_service import (
    create_contract,
    get_all_contracts,
    get_contract_by_id,
    update_contract,
    delete_contract,
)

router = APIRouter(tags=["contract"])


@router.get("/contracts/expiring")
def list_expiring_contracts(days: int = Query(default=30, ge=1, le=365), db: Session = Depends(get_db)) -> List[dict]:
    cutoff = date.today() + timedelta(days=days)
    contracts = get_all_contracts(db)
    rows = []
    for c in contracts:
        if c.end_date and c.end_date <= cutoff:
            remaining = (c.end_date - date.today()).days
            rows.append(
                {
                    "id": c.id,
                    "name": c.name,
                    "client_id": c.client_id,
                    "end_date": c.end_date,
                    "days_remaining": remaining,
                }
            )
    return sorted(rows, key=lambda row: row["end_date"])


@router.get("/contracts/", response_model=List[Contract])
def list_contracts(db: Session = Depends(get_db)):
    return get_all_contracts(db)


@router.get("/contracts/{contract_id}", response_model=Contract)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    c = get_contract_by_id(db, contract_id)
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    return c


@router.post("/contracts/", response_model=Contract)
def create_new_contract(c: ContractCreate, db: Session = Depends(get_db)):
    return create_contract(db, c)


@router.put("/contracts/{contract_id}", response_model=Contract)
def update_existing_contract(contract_id: int, c: ContractUpdate, db: Session = Depends(get_db)):
    return update_contract(db, contract_id, c)


@router.delete("/contracts/{contract_id}")
def delete_existing_contract(contract_id: int, db: Session = Depends(get_db)):
    delete_contract(db, contract_id)
    return {"ok": True}
