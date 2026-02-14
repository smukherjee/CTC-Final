from typing import List, Optional
from ..schemas.vendor import Vendor, VendorCreate, VendorUpdate
from ..models.vendor import VendorModel
from ..db import SessionLocal


def _model_to_vendor(m: VendorModel) -> Vendor:
    return Vendor(
        id=m.id,
        name=m.name,
        type=m.type,
        gstin=m.gstin,
        mobile=m.mobile,
        address=m.address,
        tds_certificate_url=m.tds_certificate_url,
        pan=getattr(m, 'pan', None),
    )


def get_all_vendors() -> List[Vendor]:
    db = SessionLocal()
    try:
        rows = db.query(VendorModel).all()
        return [_model_to_vendor(r) for r in rows]
    finally:
        db.close()


def get_vendor_by_id(vendor_id: int) -> Optional[Vendor]:
    db = SessionLocal()
    try:
        r = db.query(VendorModel).filter(VendorModel.id == vendor_id).first()
        return _model_to_vendor(r) if r else None
    finally:
        db.close()


def create_vendor(v: VendorCreate) -> Vendor:
    db = SessionLocal()
    try:
        new = VendorModel(**v.dict())
        db.add(new)
        db.commit()
        db.refresh(new)
        return _model_to_vendor(new)
    finally:
        db.close()


def update_vendor(vendor_id: int, v: VendorUpdate) -> Vendor:
    db = SessionLocal()
    try:
        r = db.query(VendorModel).filter(VendorModel.id == vendor_id).first()
        if not r:
            raise KeyError("Vendor not found")
        for k, val in v.dict().items():
            if val is not None:
                setattr(r, k, val)
        db.add(r)
        db.commit()
        db.refresh(r)
        return _model_to_vendor(r)
    finally:
        db.close()


def delete_vendor(vendor_id: int) -> None:
    db = SessionLocal()
    try:
        db.query(VendorModel).filter(VendorModel.id == vendor_id).delete()
        db.commit()
    finally:
        db.close()
