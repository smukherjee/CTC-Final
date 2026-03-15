from pydantic import BaseModel, ConfigDict
from typing import Optional


class Vendor(BaseModel):
    model_config = ConfigDict(extra='forbid')

    id: int
    name: str
    type: str
    mobile: Optional[str] = None
    address: Optional[str] = None
    tds_certificate_url: Optional[str] = None
    pan: Optional[str] = None


class VendorCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')

    name: str
    type: str
    mobile: Optional[str] = None
    address: Optional[str] = None
    tds_certificate_url: Optional[str] = None
    pan: Optional[str] = None


class VendorUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')

    name: Optional[str] = None
    type: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    tds_certificate_url: Optional[str] = None
    pan: Optional[str] = None


# Maintain backward compat alias
VendorResponse = Vendor
