from pydantic import BaseModel
from typing import Optional
from datetime import date


class Contract(BaseModel):
    id: int
    name: str
    client_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    expiry_alert_days: Optional[int] = None
    notes: Optional[str] = None


class ContractCreate(BaseModel):
    name: str
    client_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    expiry_alert_days: Optional[int] = None
    notes: Optional[str] = None


class ContractUpdate(BaseModel):
    name: Optional[str] = None
    client_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    expiry_alert_days: Optional[int] = None
    notes: Optional[str] = None
