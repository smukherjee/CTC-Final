from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class PaymentReceiptBase(BaseModel):
    payment_date: date
    invoice_id: Optional[int] = None
    received_from_id: Optional[int] = None
    received_from: Optional[str] = None
    total_billed_amount: float
    tds_deducted: float = 0
    net_amount: Optional[float] = None
    other_deduction: float = 0
    deduction_remarks: Optional[str] = None
    payment_mode: str = "BANK"
    financial_year: Optional[str] = None


class PaymentReceiptCreate(PaymentReceiptBase):
    pass


class PaymentReceiptUpdate(BaseModel):
    payment_date: Optional[date] = None
    invoice_id: Optional[int] = None
    received_from_id: Optional[int] = None
    received_from: Optional[str] = None
    total_billed_amount: Optional[float] = None
    tds_deducted: Optional[float] = None
    net_amount: Optional[float] = None
    other_deduction: Optional[float] = None
    deduction_remarks: Optional[str] = None
    payment_mode: Optional[str] = None
    financial_year: Optional[str] = None


class PaymentReceiptResponse(PaymentReceiptBase):
    id: int
    financial_year: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
