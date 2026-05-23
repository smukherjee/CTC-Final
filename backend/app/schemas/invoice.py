from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator, model_validator


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

    @field_validator('freight', 'loading_detention', 'unloading_charges',
                     'unloading_detention', 'other_charges', 'total', mode='before')
    @classmethod
    def non_negative_line_amount(cls, v):
        if v is not None and float(v) < 0:
            raise ValueError('Amount must be non-negative')
        return v


class InvoiceLineCreate(BaseModel):
    lr_id: int
    s_no: Optional[int] = None


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
    tax_on_reverse_charge: Optional[bool] = False
    reverse_charge: Optional[bool] = False
    gst_paid_by: Optional[str] = None
    total_amount: Optional[float] = 0
    tds_amount: Optional[float] = 0
    net_amount: Optional[float] = None
    status: Optional[str] = "draft"

    @field_validator('total_amount', 'tds_amount', 'net_amount', mode='before')
    @classmethod
    def non_negative_invoice_amount(cls, v):
        if v is not None and float(v) < 0:
            raise ValueError('Amount must be non-negative')
        return v

    @model_validator(mode='after')
    def tds_not_exceeds_total(self):
        if self.tds_amount is not None and self.total_amount is not None:
            if float(self.tds_amount) > float(self.total_amount) + 0.01:
                raise ValueError('tds_amount cannot exceed total_amount')
        return self


class InvoiceCreate(InvoiceBase):
    lines: List[InvoiceLineCreate] = []


class InvoiceUpdate(BaseModel):
    invoice_date: Optional[date] = None
    client_id: Optional[int] = None
    financial_year: Optional[str] = None
    po_no: Optional[str] = None
    po_date: Optional[date] = None
    hsn_code: Optional[str] = None
    tax_on_reverse_charge: Optional[bool] = None
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
    financial_year: str
    gross_amount: float = 0
    amount_received: float = 0
    outstanding_amount: float = 0
    edited: bool = False
    edited_at: Optional[datetime] = None
    edited_by: Optional[str] = None
    lines: List[InvoiceLineResponse] = []

    class Config:
        from_attributes = True
