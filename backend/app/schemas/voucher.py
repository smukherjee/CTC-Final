from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class VoucherResponse(BaseModel):
    id: int
    voucher_type: str
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    amount: float
    narration: Optional[str] = None
    date: date
    financial_year: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
