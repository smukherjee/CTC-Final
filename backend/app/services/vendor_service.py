from typing import List, Optional

from sqlalchemy.orm import Session

from ..schemas.vendor import Vendor, VendorCreate, VendorUpdate
from ..models.vendor import VendorModel


def _model_to_vendor(m: VendorModel) -> Vendor:
    return Vendor(
        id=m.id,
        name=m.name,
        type=m.type,
        mobile=m.mobile,
        address=m.address,
        tds_certificate_url=m.tds_certificate_url,
        pan=m.pan,
    )


def get_all_vendors(db: Session) -> List[Vendor]:
    rows = db.query(VendorModel).all()
    return [_model_to_vendor(r) for r in rows]


def get_vendor_by_id(db: Session, vendor_id: int) -> Optional[Vendor]:
    r = db.query(VendorModel).filter(VendorModel.id == vendor_id).first()
    return _model_to_vendor(r) if r else None


def create_vendor(db: Session, v: VendorCreate) -> Vendor:
    new = VendorModel(**v.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    return _model_to_vendor(new)


def update_vendor(db: Session, vendor_id: int, v: VendorUpdate) -> Vendor:
    r = db.query(VendorModel).filter(VendorModel.id == vendor_id).first()
    if not r:
        raise KeyError("Vendor not found")
    # Use exclude_unset=True so fields not sent by the client are skipped,
    # but explicitly-sent null values (e.g. clearing PAN) are honoured.
    for k, val in v.model_dump(exclude_unset=True).items():
        setattr(r, k, val)
    db.add(r)
    db.commit()
    db.refresh(r)
    return _model_to_vendor(r)


def delete_vendor(db: Session, vendor_id: int) -> None:
    db.query(VendorModel).filter(VendorModel.id == vendor_id).delete()
    db.commit()
