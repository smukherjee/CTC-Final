from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..schemas.vendor import Vendor, VendorCreate, VendorUpdate
from ..services.vendor_service import (
    get_all_vendors, get_vendor_by_id, create_vendor, update_vendor, delete_vendor
)

router = APIRouter(prefix="/vendor", tags=["vendor"])

@router.get("/", response_model=List[Vendor])
def list_vendors(db: Session = Depends(get_db)):
    return get_all_vendors(db)

@router.get("/{vendor_id}", response_model=Vendor)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.post("/", response_model=Vendor)
def create_new_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    return create_vendor(db, vendor)

@router.put("/{vendor_id}", response_model=Vendor)
def update_existing_vendor(vendor_id: int, vendor: VendorUpdate, db: Session = Depends(get_db)):
    return update_vendor(db, vendor_id, vendor)

@router.delete("/{vendor_id}")
def delete_existing_vendor(vendor_id: int, db: Session = Depends(get_db)):
    delete_vendor(db, vendor_id)
    return {"ok": True}
