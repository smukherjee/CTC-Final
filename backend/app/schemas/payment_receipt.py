from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class PaymentReceiptBase(BaseModel):
    payment_date: date
    invoice_id: Optional[int] = None
    received_from_id: Optional[int] = None
    received_from: Optional[str] = None
    amount: float
    payment_mode: str = "BANK"
    financial_year: Optional[str] = None
    notes: Optional[str] = None


class PaymentReceiptCreate(PaymentReceiptBase):
    pass


class PaymentReceiptUpdate(BaseModel):
    payment_date: Optional[date] = None
    invoice_id: Optional[int] = None
    received_from_id: Optional[int] = None
    received_from: Optional[str] = None
    amount: Optional[float] = None
    payment_mode: Optional[str] = None
    financial_year: Optional[str] = None
    notes: Optional[str] = None


class PaymentReceiptResponse(PaymentReceiptBase):
    id: int
    financial_year: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
