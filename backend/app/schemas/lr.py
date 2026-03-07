from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import date


class GoodsLineItem(BaseModel):
    id: str
    articles_count: int
    description: str
    weight_qtl: float
    weight_kg: float
    rate_per_qtl: float
    freight_rs: float
    freight_p: float


class LRCreate(BaseModel):
    lr_number: str
    date: Optional[str] = None
    consignor_id: Optional[str] = None
    consignor_name: Optional[str] = None
    consignee_id: Optional[str] = None
    consignee_name: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    delivery_at: Optional[str] = None
    through: Optional[str] = None
    through_id: Optional[int] = None
    fob: Optional[str] = None
    goods_items: Optional[List[Any]] = None
    articles_count: Optional[int] = None
    articles_description: Optional[str] = None
    weight: Optional[float] = None
    freight_amount: Optional[float] = None
    # Vehicle
    vehicle_id: Optional[int] = None
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    seal_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_mobile: Optional[str] = None

    # Risk
    booked_on_owners_risk: Optional[bool] = False
    loading_point_times: Optional[Any] = None # JSON

    # Financials
    value_rs: Optional[float] = None
    surcharge: Optional[float] = None
    hamali_charges: Optional[float] = None
    st_charges: Optional[float] = None
    total: Optional[float] = None

    # Dispatch Register
    bill_number: Optional[str] = None
    bill_date: Optional[str] = None
    amount_passed: Optional[float] = None
    deductions: Optional[str] = None
    cm_no: Optional[str] = None
    cm_date: Optional[str] = None
    remarks: Optional[str] = None
    eway_bill: Optional[Any] = None # JSON
    eway_bills: Optional[List[Any]] = None
    pod_url: Optional[str] = None
    pod_verified_at: Optional[str] = None

    status: Optional[str] = None
    # Financial year scoping
    financial_year: Optional[str] = None
    # FOB client link
    fob_client_id: Optional[int] = None
    # POD
    pod_received: Optional[bool] = None
    pod_file_id: Optional[int] = None
    # Inline E-way bill
    eway_bill_no: Optional[str] = None
    eway_bill_expiry: Optional[str] = None


class LRUpdate(BaseModel):
    lr_number: Optional[str] = None
    date: Optional[str] = None
    consignor_id: Optional[str] = None
    consignor_name: Optional[str] = None
    consignee_id: Optional[str] = None
    consignee_name: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    delivery_at: Optional[str] = None
    through: Optional[str] = None
    through_id: Optional[int] = None
    fob: Optional[str] = None
    goods_items: Optional[List[Any]] = None
    articles_count: Optional[int] = None
    articles_description: Optional[str] = None
    weight: Optional[float] = None
    freight_amount: Optional[float] = None
    # Vehicle
    vehicle_id: Optional[int] = None
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    seal_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_mobile: Optional[str] = None
    # Risk
    booked_on_owners_risk: Optional[bool] = None
    loading_point_times: Optional[Any] = None
    # Financials
    value_rs: Optional[float] = None
    surcharge: Optional[float] = None
    hamali_charges: Optional[float] = None
    st_charges: Optional[float] = None
    total: Optional[float] = None
    # Dispatch Register
    bill_number: Optional[str] = None
    bill_date: Optional[str] = None
    amount_passed: Optional[float] = None
    deductions: Optional[str] = None
    cm_no: Optional[str] = None
    cm_date: Optional[str] = None
    remarks: Optional[str] = None
    eway_bill: Optional[Any] = None
    eway_bills: Optional[List[Any]] = None
    pod_url: Optional[str] = None
    pod_verified_at: Optional[str] = None
    status: Optional[str] = None
    # Financial year scoping
    financial_year: Optional[str] = None
    fob_client_id: Optional[int] = None
    pod_received: Optional[bool] = None
    pod_file_id: Optional[int] = None
    eway_bill_no: Optional[str] = None
    eway_bill_expiry: Optional[str] = None


class LREwayBillPatch(BaseModel):
    eway_bill_no: Optional[str] = None
    eway_bill_expiry: Optional[str] = None


class LRPodPatch(BaseModel):
    pod_received: bool
    pod_file_id: Optional[int] = None


class LRResponse(LRCreate):
    id: int

    class Config:
        orm_mode = True
