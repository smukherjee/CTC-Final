from pydantic import BaseModel
from typing import Optional


class EWayBillCreate(BaseModel):
    lr_id: int
    number: str
    valid_from: Optional[str] = None
    valid_upto: Optional[str] = None
    status: Optional[str] = None
    file_url: Optional[str] = None
    meta: Optional[dict] = None


class EWayBillUpdate(BaseModel):
    number: Optional[str] = None
    valid_from: Optional[str] = None
    valid_upto: Optional[str] = None
    status: Optional[str] = None
    file_url: Optional[str] = None
    alert_sent: Optional[bool] = None
    meta: Optional[dict] = None


class EWayBillResponse(BaseModel):
    id: int
    lr_id: int
    number: str
    valid_from: Optional[str] = None
    valid_upto: Optional[str] = None
    status: Optional[str] = None
    alert_sent: Optional[bool] = False
    file_url: Optional[str] = None
    meta: Optional[dict] = None

    class Config:
        orm_mode = True
