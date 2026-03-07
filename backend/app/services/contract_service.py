from typing import List, Optional
from ..schemas.contract import Contract, ContractCreate, ContractUpdate
from ..models.contract import ContractModel
from ..db import SessionLocal


def _model_to_contract(m: ContractModel) -> Contract:
    return Contract(
        id=m.id,
        name=m.name,
        client_id=m.client_id,
        start_date=m.start_date,
        end_date=m.end_date,
        expiry_alert_days=m.expiry_alert_days,
        notes=m.notes,
    )


def get_all_contracts() -> List[Contract]:
    db = SessionLocal()
    try:
        rows = db.query(ContractModel).all()
        return [_model_to_contract(r) for r in rows]
    finally:
        db.close()


def get_contract_by_id(contract_id: int) -> Optional[Contract]:
    db = SessionLocal()
    try:
        r = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
        return _model_to_contract(r) if r else None
    finally:
        db.close()


def create_contract(c: ContractCreate) -> Contract:
    db = SessionLocal()
    try:
        new = ContractModel(**c.dict())
        db.add(new)
        db.commit()
        db.refresh(new)
        return _model_to_contract(new)
    finally:
        db.close()


def update_contract(contract_id: int, c: ContractUpdate) -> Contract:
    db = SessionLocal()
    try:
        r = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
        if not r:
            raise KeyError("Contract not found")
        for k, val in c.dict().items():
            if val is not None:
                setattr(r, k, val)
        db.add(r)
        db.commit()
        db.refresh(r)
        return _model_to_contract(r)
    finally:
        db.close()


def delete_contract(contract_id: int) -> None:
    db = SessionLocal()
    try:
        db.query(ContractModel).filter(ContractModel.id == contract_id).delete()
        db.commit()
    finally:
        db.close()
