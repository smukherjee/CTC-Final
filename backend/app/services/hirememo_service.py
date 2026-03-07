from typing import Optional
from datetime import date
from ..models.hirememo import HireMemoModel
from ..db import SessionLocal
from ..core.financial_year_utils import fy_from_date as _fy_from_date, next_hirememo_seq as _next_hirememo_seq
from ..services.voucher_service import sync_hirememo_advance_vouchers as _sync_hirememo_advance_vouchers


def calculate_balance(total: float, cash: Optional[float], bank: Optional[float]) -> float:
    cash = cash or 0
    bank = bank or 0
    return float(total) - float(cash) - float(bank)


def get_all_hirememos(lr_id: Optional[int] = None, fy: Optional[str] = None):
    session = SessionLocal()
    try:
        query = session.query(HireMemoModel)
        if lr_id is not None:
            query = query.filter(HireMemoModel.lr_id == lr_id)
        if fy is not None:
            query = query.filter(HireMemoModel.financial_year == fy)
        return query.order_by(HireMemoModel.id.desc()).all()
    finally:
        session.close()


def get_hirememo_by_id(hm_id: int):
    session = SessionLocal()
    try:
        return session.query(HireMemoModel).filter(HireMemoModel.id == hm_id).first()
    finally:
        session.close()


def _apply_payload(hm: HireMemoModel, payload: dict, partial: bool = False):
    if partial:
        for field in (
            "lr_id",
            "hire_memo_no",
            "hire_memo_date",
            "branch",
            "vehicle_id",
            "vehicle_number",
            "driver_name",
            "driver_mobile",
            "driver_license",
            "from_location",
            "to_location",
            "payment_location",
            "rate_type",
            "freight_rate",
            "freight_weight",
            "guaranteed_weight",
            "total_amount",
            "advance_cash",
            "advance_bank",
            "commission",
            "hamali",
            "mamul",
            "other_deductions",
            "ack_status",
            "notes",
        ):
            if field in payload:
                setattr(hm, field, payload[field])
    else:
        hm.lr_id = payload.get("lr_id", hm.lr_id)
        # Meta
        if payload.get("hire_memo_no") is not None:
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
        # Deductions
        hm.commission = payload.get("commission", 0)
        hm.hamali = payload.get("hamali", 0)
        hm.mamul = payload.get("mamul", 0)
        hm.other_deductions = payload.get("other_deductions", 0)
        hm.ack_status = payload.get("ack_status", "PENDING")
        hm.notes = payload.get("notes")

    hm.balance = calculate_balance(hm.total_amount, hm.advance_cash, hm.advance_bank)


def create_hirememo(payload: dict):
    # create_tables() - deprecated, use alembic
    session = SessionLocal()
    try:
        lr_id = payload.get("lr_id")

        # Determine financial year
        hm_date = payload.get("hire_memo_date")
        if isinstance(hm_date, str) and hm_date:
            try:
                hm_date = date.fromisoformat(hm_date)
            except ValueError:
                hm_date = None
        fy = _fy_from_date(hm_date) if hm_date else _fy_from_date(date.today())

        existing = None
        if lr_id is not None:
            existing = session.query(HireMemoModel).filter(HireMemoModel.lr_id == lr_id).first()

        if existing:
            _apply_payload(existing, payload, partial=False)
            existing.financial_year = fy
            hm = existing
        else:
            hm = HireMemoModel(lr_id=lr_id)
            _apply_payload(hm, payload, partial=False)
            hm.financial_year = fy
            # Auto-assign hire memo sequence scoped to financial year.
            seq = _next_hirememo_seq(session, fy)
            hm.hire_memo_no = str(seq)

        session.add(hm)
        session.flush()
        _sync_hirememo_advance_vouchers(
            session,
            hirememo_id=hm.id,
            hirememo_no=hm.hire_memo_no,
            hirememo_date=hm.hire_memo_date,
            advance_cash=float(hm.advance_cash or 0),
            advance_bank=float(hm.advance_bank or 0),
        )
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
        _apply_payload(hm, payload, partial=True)
        session.flush()
        _sync_hirememo_advance_vouchers(
            session,
            hirememo_id=hm.id,
            hirememo_no=hm.hire_memo_no,
            hirememo_date=hm.hire_memo_date,
            advance_cash=float(hm.advance_cash or 0),
            advance_bank=float(hm.advance_bank or 0),
        )
        session.commit()
        session.refresh(hm)
        return hm
    finally:
        session.close()
