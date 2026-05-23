from typing import List, Optional

from sqlalchemy.orm import Session

from ..schemas.client import Client, ClientCreate, ClientUpdate
from ..models.client import ClientModel


def _model_to_client(m: ClientModel) -> Client:
    return Client(
        id=m.id,
        name=m.name,
        type=m.type,
        gstin=m.gstin,
        mobile=m.mobile,
        address=m.address,
        tds_rate=float(m.tds_rate) if m.tds_rate is not None else 0.0,
    )


def get_all_clients(db: Session) -> List[Client]:
    rows = db.query(ClientModel).all()
    return [_model_to_client(r) for r in rows]


def get_client_by_id(db: Session, client_id: int) -> Optional[Client]:
    r = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    return _model_to_client(r) if r else None


def create_client(db: Session, p: ClientCreate) -> Client:
    new = ClientModel(**p.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    return _model_to_client(new)


def update_client(db: Session, client_id: int, p: ClientUpdate) -> Client:
    r = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    if not r:
        raise KeyError("Client not found")
    for k, v in p.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    db.add(r)
    db.commit()
    db.refresh(r)
    return _model_to_client(r)


def delete_client(db: Session, client_id: int) -> None:
    db.query(ClientModel).filter(ClientModel.id == client_id).delete()
    db.commit()
