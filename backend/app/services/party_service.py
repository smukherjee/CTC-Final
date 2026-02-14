from typing import List, Optional
from ..schemas.party import Party, PartyCreate, PartyUpdate
from ..models.party import PartyModel
from ..db import SessionLocal


def _model_to_party(m: PartyModel) -> Party:
    return Party(
        id=m.id,
        name=m.name,
        type=m.type,
        gstin=m.gstin,
        mobile=m.mobile,
        address=m.address,
    )


def get_all_parties() -> List[Party]:
    db = SessionLocal()
    try:
        rows = db.query(PartyModel).all()
        return [_model_to_party(r) for r in rows]
    finally:
        db.close()


def get_party_by_id(party_id: int) -> Optional[Party]:
    db = SessionLocal()
    try:
        r = db.query(PartyModel).filter(PartyModel.id == party_id).first()
        return _model_to_party(r) if r else None
    finally:
        db.close()


def create_party(p: PartyCreate) -> Party:
    db = SessionLocal()
    try:
        new = PartyModel(**p.dict())
        db.add(new)
        db.commit()
        db.refresh(new)
        return _model_to_party(new)
    finally:
        db.close()


def update_party(party_id: int, p: PartyUpdate) -> Party:
    db = SessionLocal()
    try:
        r = db.query(PartyModel).filter(PartyModel.id == party_id).first()
        if not r:
            raise KeyError("Party not found")
        for k, v in p.dict().items():
            if v is not None:
                setattr(r, k, v)
        db.add(r)
        db.commit()
        db.refresh(r)
        return _model_to_party(r)
    finally:
        db.close()


def delete_party(party_id: int) -> None:
    db = SessionLocal()
    try:
        db.query(PartyModel).filter(PartyModel.id == party_id).delete()
        db.commit()
    finally:
        db.close()
