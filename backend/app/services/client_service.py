from typing import List, Optional
from ..schemas.client import Client, ClientCreate, ClientUpdate
from ..models.client import ClientModel
from ..db import SessionLocal


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


def get_all_clients() -> List[Client]:
    db = SessionLocal()
    try:
        rows = db.query(ClientModel).all()
        return [_model_to_client(r) for r in rows]
    finally:
        db.close()


def get_client_by_id(client_id: int) -> Optional[Client]:
    db = SessionLocal()
    try:
        r = db.query(ClientModel).filter(ClientModel.id == client_id).first()
        return _model_to_client(r) if r else None
    finally:
        db.close()


def create_client(p: ClientCreate) -> Client:
    db = SessionLocal()
    try:
        new = ClientModel(**p.dict())
        db.add(new)
        db.commit()
        db.refresh(new)
        return _model_to_client(new)
    finally:
        db.close()


def update_client(client_id: int, p: ClientUpdate) -> Client:
    db = SessionLocal()
    try:
        r = db.query(ClientModel).filter(ClientModel.id == client_id).first()
        if not r:
            raise KeyError("Client not found")
        for k, v in p.dict().items():
            if v is not None:
                setattr(r, k, v)
        db.add(r)
        db.commit()
        db.refresh(r)
        return _model_to_client(r)
    finally:
        db.close()


def delete_client(client_id: int) -> None:
    db = SessionLocal()
    try:
        db.query(ClientModel).filter(ClientModel.id == client_id).delete()
        db.commit()
    finally:
        db.close()
