from datetime import date
from typing import List, Optional

from pydantic import BaseModel


class InvoiceLineBase(BaseModel):
    lr_id: Optional[int] = None
    s_no: Optional[int] = None
    lr_no: Optional[str] = None
    lr_date: Optional[date] = None
    qty: Optional[float] = None
    particulars: Optional[str] = None
    v_type: Optional[str] = None
    vehicle_no: Optional[str] = None
    consignor: Optional[str] = None
    consignee: Optional[str] = None
    from_city: Optional[str] = None
    to_city: Optional[str] = None
    freight: Optional[float] = 0
    loading_detention: Optional[float] = 0
    unloading_charges: Optional[float] = 0
    unloading_detention: Optional[float] = 0
    other_charges: Optional[float] = 0
    total: Optional[float] = 0


class InvoiceLineCreate(InvoiceLineBase):
    pass


class InvoiceLineResponse(InvoiceLineBase):
    id: int
    invoice_id: int

    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    invoice_date: date
    client_id: int
    financial_year: Optional[str] = None
    po_no: Optional[str] = None
    po_date: Optional[date] = None
    hsn_code: Optional[str] = "996791"
    reverse_charge: Optional[bool] = False
    gst_paid_by: Optional[str] = None
    total_amount: float
    tds_amount: Optional[float] = 0
    net_amount: Optional[float] = None
    status: Optional[str] = "draft"


class InvoiceCreate(InvoiceBase):
    lines: List[InvoiceLineCreate] = []


class InvoiceUpdate(BaseModel):
    invoice_date: Optional[date] = None
    client_id: Optional[int] = None
    financial_year: Optional[str] = None
    po_no: Optional[str] = None
    po_date: Optional[date] = None
    hsn_code: Optional[str] = None
    reverse_charge: Optional[bool] = None
    gst_paid_by: Optional[str] = None
    total_amount: Optional[float] = None
    tds_amount: Optional[float] = None
    net_amount: Optional[float] = None
    status: Optional[str] = None
    lines: Optional[List[InvoiceLineCreate]] = None


class InvoiceResponse(InvoiceBase):
    id: int
    invoice_no: str
    lines: List[InvoiceLineResponse] = []

    class Config:
        from_attributes = True
