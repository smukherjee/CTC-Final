from pydantic import BaseModel, field_validator, model_validator
from typing import List, Optional, Any
from datetime import date


class LRDeductionItem(BaseModel):
    deduction_label: str
    deduction_amount: float
    sort_order: Optional[int] = 0

    @model_validator(mode='before')
    @classmethod
    def normalize_legacy_keys(cls, data):
        if isinstance(data, dict):
            payload = dict(data)
            if payload.get('deduction_label') in (None, '') and payload.get('deduction_name') not in (None, ''):
                payload['deduction_label'] = payload.get('deduction_name')
            if payload.get('deduction_amount') is None and payload.get('amount') is not None:
                payload['deduction_amount'] = payload.get('amount')
            return payload
        return data

    @field_validator('deduction_amount', mode='before')
    @classmethod
    def non_negative_deduction(cls, v):
        if v is not None and float(v) < 0:
            raise ValueError('Deduction amount must be non-negative')
        return v


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
    lr_deductions: Optional[List[LRDeductionItem]] = None

    @field_validator('weight', 'freight_amount', 'value_rs', 'surcharge',
                     'hamali_charges', 'st_charges', 'total', 'amount_passed',
                     mode='before')
    @classmethod
    def non_negative_amount(cls, v):
        if v is not None and float(v) < 0:
            raise ValueError('Amount must be non-negative')
        return v

    @model_validator(mode='after')
    def bill_date_after_lr_date(self):
        if self.date and self.bill_date:
            try:
                from datetime import date as _date
                lr_d = _date.fromisoformat(str(self.date))
                bill_d = _date.fromisoformat(str(self.bill_date))
                if bill_d < lr_d:
                    raise ValueError('bill_date cannot be before LR date')
            except (ValueError, TypeError):
                pass  # date parsing errors surfaced elsewhere
        return self


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
    lr_deductions: Optional[List[LRDeductionItem]] = None


class LREwayBillPatch(BaseModel):
    eway_bill_no: Optional[str] = None
    eway_bill_expiry: Optional[str] = None


class LRPodPatch(BaseModel):
    pod_received: bool
    pod_file_id: Optional[int] = None


class LRResponse(LRCreate):
    id: int
    financial_year: str

    class Config:
        orm_mode = True
