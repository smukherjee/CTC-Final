from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class PaymentReceiptBase(BaseModel):
    payment_date: date
    amount: float
    received_from: str
    financial_year: Optional[str] = None
    notes: Optional[str] = None


class PaymentReceiptCreate(PaymentReceiptBase):
    pass


class PaymentReceiptUpdate(BaseModel):
    payment_date: Optional[date] = None
    amount: Optional[float] = None
    received_from: Optional[str] = None
    financial_year: Optional[str] = None
    notes: Optional[str] = None


class PaymentReceiptResponse(PaymentReceiptBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
