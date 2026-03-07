from pydantic import BaseModel
from typing import Optional


class Vendor(BaseModel):
    id: int
    name: str
    type: str
    mobile: Optional[str] = None
    address: Optional[str] = None
    tds_certificate_url: Optional[str] = None
    pan: Optional[str] = None


class VendorCreate(BaseModel):
    name: str
    type: str
    mobile: Optional[str] = None
    address: Optional[str] = None
    tds_certificate_url: Optional[str] = None
    pan: Optional[str] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    tds_certificate_url: Optional[str] = None
    pan: Optional[str] = None


# Maintain backward compat alias
VendorResponse = Vendor
