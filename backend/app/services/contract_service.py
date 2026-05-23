from typing import List, Optional

from sqlalchemy.orm import Session

from ..schemas.contract import Contract, ContractCreate, ContractUpdate
from ..models.contract import ContractModel


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


def get_all_contracts(db: Session) -> List[Contract]:
    rows = db.query(ContractModel).all()
    return [_model_to_contract(r) for r in rows]


def get_contract_by_id(db: Session, contract_id: int) -> Optional[Contract]:
    r = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    return _model_to_contract(r) if r else None


def create_contract(db: Session, c: ContractCreate) -> Contract:
    new = ContractModel(**c.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    return _model_to_contract(new)


def update_contract(db: Session, contract_id: int, c: ContractUpdate) -> Contract:
    r = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not r:
        raise KeyError("Contract not found")
    for k, val in c.model_dump(exclude_unset=True).items():
        setattr(r, k, val)
    db.add(r)
    db.commit()
    db.refresh(r)
    return _model_to_contract(r)


def delete_contract(db: Session, contract_id: int) -> None:
    db.query(ContractModel).filter(ContractModel.id == contract_id).delete()
    db.commit()
