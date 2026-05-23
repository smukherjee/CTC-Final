from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class HireMemoBase(BaseModel):
    lr_id: int
    total_amount: float
    advance_cash: Optional[float] = 0.0
    advance_bank: Optional[float] = 0.0
    advance_payment_date: Optional[date] = None
    balance: Optional[float] = None
    balance_payment_date: Optional[date] = None
    # Driver
    driver_name: Optional[str] = None
    driver_mobile: Optional[str] = None
    driver_license: Optional[str] = None
    
    # Meta
    hire_memo_date: Optional[date] = None
    branch: Optional[str] = None

    # Vehicle
    vehicle_id: Optional[int] = None
    vehicle_number: Optional[str] = None

    # Route
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    payment_location: Optional[str] = None

    # Financials
    rate_type: Optional[str] = None # FIXED, PER_TON
    freight_rate: Optional[float] = None
    freight_weight: Optional[float] = None
    guaranteed_weight: Optional[float] = None
    
    # Deductions
    commission: Optional[float] = 0.0
    hamali: Optional[float] = 0.0
    mamul: Optional[float] = 0.0
    other_deductions: Optional[float] = 0.0

    ack_status: Optional[str] = 'PENDING'
    notes: Optional[str] = None


class HireMemoCreate(HireMemoBase):
    class Config:
        extra = 'forbid'


class HireMemoUpdate(BaseModel):
    total_amount: Optional[float] = None
    advance_cash: Optional[float] = None
    advance_bank: Optional[float] = None
    advance_payment_date: Optional[date] = None
    balance: Optional[float] = None
    balance_payment_date: Optional[date] = None
    driver_name: Optional[str] = None
    driver_mobile: Optional[str] = None
    driver_license: Optional[str] = None

    # Meta
    hire_memo_no: Optional[str] = None
    hire_memo_date: Optional[date] = None
    branch: Optional[str] = None

    # Vehicle
    vehicle_id: Optional[int] = None
    vehicle_number: Optional[str] = None

    # Route
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    payment_location: Optional[str] = None

    # Financials
    rate_type: Optional[str] = None
    freight_rate: Optional[float] = None
    freight_weight: Optional[float] = None
    guaranteed_weight: Optional[float] = None
    
    # Deductions
    commission: Optional[float] = None
    hamali: Optional[float] = None
    mamul: Optional[float] = None
    other_deductions: Optional[float] = None

    ack_status: Optional[str] = None
    notes: Optional[str] = None


class HireMemo(HireMemoBase):
    id: int
    hire_memo_no: Optional[str] = None
    financial_year: str
    balance: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# Backward compat alias
HireMemoResponse = HireMemo
