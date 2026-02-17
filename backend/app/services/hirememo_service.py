from typing import List, Optional
from ..models.hirememo import HireMemoModel, create_tables
from ..db import SessionLocal


def calculate_balance(total: float, cash: Optional[float], bank: Optional[float]) -> float:
    cash = cash or 0
    bank = bank or 0
    return float(total) - float(cash) - float(bank)


def get_all_hirememos():
    session = SessionLocal()
    try:
        return session.query(HireMemoModel).all()
    finally:
        session.close()


def get_hirememo_by_id(hm_id: int):
    session = SessionLocal()
    try:
        return session.query(HireMemoModel).filter(HireMemoModel.id == hm_id).first()
    finally:
        session.close()


def create_hirememo(payload: dict):
    # create_tables() - deprecated, use alembic
    session = SessionLocal()
    try:
        balance = calculate_balance(payload.get("total_amount", 0), payload.get("advance_cash"), payload.get("advance_bank"))
        hm = HireMemoModel(
            lr_id=payload.get("lr_id"),
            # Meta
            hire_memo_no=payload.get("hire_memo_no"),
            hire_memo_date=payload.get("hire_memo_date"),
            branch=payload.get("branch"),
            # Vehicle & Driver
            vehicle_id=payload.get("vehicle_id"),
            vehicle_number=payload.get("vehicle_number"),
            driver_name=payload.get("driver_name"),
            driver_mobile=payload.get("driver_mobile"),
            driver_license=payload.get("driver_license"),
            # Route
            from_location=payload.get("from_location"),
            to_location=payload.get("to_location"),
            payment_location=payload.get("payment_location"),
            # Financials
            rate_type=payload.get("rate_type"),
            freight_rate=payload.get("freight_rate"),
            freight_weight=payload.get("freight_weight"),
            guaranteed_weight=payload.get("guaranteed_weight"),
            total_amount=payload.get("total_amount", 0),
            advance_cash=payload.get("advance_cash", 0),
            advance_bank=payload.get("advance_bank", 0),
            balance=balance,
            # Deductions
            commission=payload.get("commission", 0),
            hamali=payload.get("hamali", 0),
            mamul=payload.get("mamul", 0),
            other_deductions=payload.get("other_deductions", 0),
            ack_status=payload.get("ack_status", "PENDING"),
            notes=payload.get("notes"),
        )
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
