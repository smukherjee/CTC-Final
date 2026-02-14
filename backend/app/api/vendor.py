from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..schemas.vendor import Vendor, VendorCreate, VendorUpdate
from ..services.vendor_service import (
    get_all_vendors, get_vendor_by_id, create_vendor, update_vendor, delete_vendor
)

router = APIRouter(prefix="/vendor", tags=["vendor"])

@router.get("/", response_model=List[Vendor])
def list_vendors():
    return get_all_vendors()

@router.get("/{vendor_id}", response_model=Vendor)
def get_vendor(vendor_id: int):
    vendor = get_vendor_by_id(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.post("/", response_model=Vendor)
def create_new_vendor(vendor: VendorCreate):
    return create_vendor(vendor)

@router.put("/{vendor_id}", response_model=Vendor)
def update_existing_vendor(vendor_id: int, vendor: VendorUpdate):
    return update_vendor(vendor_id, vendor)

@router.delete("/{vendor_id}")
def delete_existing_vendor(vendor_id: int):
    delete_vendor(vendor_id)
    return {"ok": True}
