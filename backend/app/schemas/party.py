from pydantic import BaseModel
from typing import Optional


class Party(BaseModel):
    id: int
    name: str
    type: str
    gstin: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    tds_rate: Optional[float] = 0.0


class PartyCreate(BaseModel):
    name: str
    type: str
    gstin: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    tds_rate: Optional[float] = 0.0


class PartyUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    gstin: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    tds_rate: Optional[float] = None


# Backward compat alias
PartyResponse = Party
