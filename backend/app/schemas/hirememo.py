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
    total_amount: Optional[float]
    advance_cash: Optional[float]
    advance_bank: Optional[float]
    advance_payment_date: Optional[date]
    balance: Optional[float]
    balance_payment_date: Optional[date]
    driver_name: Optional[str]
    driver_mobile: Optional[str]
    driver_license: Optional[str]

    # Meta
    hire_memo_no: Optional[str]
    hire_memo_date: Optional[date]
    branch: Optional[str]

    # Vehicle
    vehicle_id: Optional[int]
    vehicle_number: Optional[str]

    # Route
    from_location: Optional[str]
    to_location: Optional[str]
    payment_location: Optional[str]

    # Financials
    rate_type: Optional[str]
    freight_rate: Optional[float]
    freight_weight: Optional[float]
    guaranteed_weight: Optional[float]
    
    # Deductions
    commission: Optional[float]
    hamali: Optional[float]
    mamul: Optional[float]
    other_deductions: Optional[float]

    ack_status: Optional[str]
    notes: Optional[str]


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
