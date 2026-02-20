from typing import List, Optional
from ..models.hirememo import HireMemoModel, create_tables
from ..db import SessionLocal


def calculate_balance(total: float, cash: Optional[float], bank: Optional[float]) -> float:
    cash = cash or 0
    bank = bank or 0
    return float(total) - float(cash) - float(bank)


def get_all_hirememos(lr_id: Optional[int] = None):
    session = SessionLocal()
    try:
        query = session.query(HireMemoModel)
        if lr_id is not None:
            query = query.filter(HireMemoModel.lr_id == lr_id)
        return query.order_by(HireMemoModel.id.desc()).all()
    finally:
        session.close()


def get_hirememo_by_id(hm_id: int):
    session = SessionLocal()
    try:
        return session.query(HireMemoModel).filter(HireMemoModel.id == hm_id).first()
    finally:
        session.close()


def _apply_payload(hm: HireMemoModel, payload: dict):
    hm.lr_id = payload.get("lr_id", hm.lr_id)
    # Meta
    hm.hire_memo_no = payload.get("hire_memo_no")
    hm.hire_memo_date = payload.get("hire_memo_date")
    hm.branch = payload.get("branch")
    # Vehicle & Driver
    hm.vehicle_id = payload.get("vehicle_id")
    hm.vehicle_number = payload.get("vehicle_number")
    hm.driver_name = payload.get("driver_name")
    hm.driver_mobile = payload.get("driver_mobile")
    hm.driver_license = payload.get("driver_license")
    # Route
    hm.from_location = payload.get("from_location")
    hm.to_location = payload.get("to_location")
    hm.payment_location = payload.get("payment_location")
    # Financials
    hm.rate_type = payload.get("rate_type")
    hm.freight_rate = payload.get("freight_rate")
    hm.freight_weight = payload.get("freight_weight")
    hm.guaranteed_weight = payload.get("guaranteed_weight")
    hm.total_amount = payload.get("total_amount", 0)
    hm.advance_cash = payload.get("advance_cash", 0)
    hm.advance_bank = payload.get("advance_bank", 0)
    hm.balance = calculate_balance(hm.total_amount, hm.advance_cash, hm.advance_bank)
    # Deductions
    hm.commission = payload.get("commission", 0)
    hm.hamali = payload.get("hamali", 0)
    hm.mamul = payload.get("mamul", 0)
    hm.other_deductions = payload.get("other_deductions", 0)
    hm.ack_status = payload.get("ack_status", "PENDING")
    hm.notes = payload.get("notes")


def create_hirememo(payload: dict):
    # create_tables() - deprecated, use alembic
    session = SessionLocal()
    try:
        lr_id = payload.get("lr_id")
        existing = None
        if lr_id is not None:
            existing = session.query(HireMemoModel).filter(HireMemoModel.lr_id == lr_id).first()

        if existing:
            _apply_payload(existing, payload)
            hm = existing
        else:
            hm = HireMemoModel(lr_id=lr_id)
            _apply_payload(hm, payload)
            session.add(hm)

        session.commit()
        session.refresh(hm)
        return hm
    except Exception as e:
        session.rollback()
        import traceback
        traceback.print_exc()
        raise ValueError(f"Failed to create HireMemo: {str(e)}")
    finally:
        session.close()


def update_hirememo(hm_id: int, payload: dict):
    session = SessionLocal()
    try:
        hm = session.query(HireMemoModel).filter(HireMemoModel.id == hm_id).first()
        if not hm:
            return None
        _apply_payload(hm, payload)
        session.commit()
        session.refresh(hm)
        return hm
    finally:
        session.close()
