from typing import Optional
from datetime import date

from sqlalchemy.orm import Session

from ..models.hirememo import HireMemoModel
from ..models.lr import LRModel
from ..core.financial_year_utils import fy_from_date as _fy_from_date, next_hirememo_seq as _next_hirememo_seq
from ..services.voucher_service import sync_hirememo_advance_vouchers as _sync_hirememo_advance_vouchers
from .audit_service import log_action


def _hm_to_dict(hm: HireMemoModel) -> dict:
    """Minimal snapshot for audit log — covers all financially relevant fields."""
    return {
        "id": hm.id,
        "lr_id": hm.lr_id,
        "hire_memo_no": hm.hire_memo_no,
        "hire_memo_date": hm.hire_memo_date.isoformat() if hm.hire_memo_date and hasattr(hm.hire_memo_date, "isoformat") else str(hm.hire_memo_date) if hm.hire_memo_date else None,
        "financial_year": hm.financial_year,
        "vehicle_number": hm.vehicle_number,
        "total_amount": float(hm.total_amount) if hm.total_amount is not None else None,
        "advance_cash": float(hm.advance_cash) if hm.advance_cash is not None else None,
        "advance_bank": float(hm.advance_bank) if hm.advance_bank is not None else None,
        "balance": float(hm.balance) if hm.balance is not None else None,
        "commission": float(hm.commission) if hm.commission is not None else None,
        "other_deductions": float(hm.other_deductions) if hm.other_deductions is not None else None,
        "ack_status": hm.ack_status,
    }


def calculate_balance(total: float, cash: Optional[float], bank: Optional[float]) -> float:
    cash = cash or 0
    bank = bank or 0
    return float(total) - float(cash) - float(bank)


def _linked_lr_hamali(session, lr_id: Optional[int]) -> float:
    if not lr_id:
        return 0.0
    lr = session.query(LRModel).filter(LRModel.id == lr_id).first()
    if not lr or lr.hamali_charges is None:
        return 0.0
    return float(lr.hamali_charges)


def _sync_lr_financials(hm: HireMemoModel, session) -> None:
    hm.hamali = _linked_lr_hamali(session, hm.lr_id)
    hm.mamul = 0.0


def get_all_hirememos(db: Session, lr_id: Optional[int] = None, fy: Optional[str] = None):
    query = db.query(HireMemoModel)
    if lr_id is not None:
        query = query.filter(HireMemoModel.lr_id == lr_id)
    if fy is not None:
        query = query.filter(HireMemoModel.financial_year == fy)
    return query.order_by(HireMemoModel.id.desc()).all()


def get_hirememo_by_id(db: Session, hm_id: int):
    return db.query(HireMemoModel).filter(HireMemoModel.id == hm_id).first()


def _apply_payload(hm: HireMemoModel, payload: dict, session, partial: bool = False):
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
            "advance_payment_date",
            "balance",
            "balance_payment_date",
            "commission",
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
        hm.advance_payment_date = payload.get("advance_payment_date")
        # Deductions
        hm.commission = payload.get("commission", 0)
        hm.other_deductions = payload.get("other_deductions", 0)
        hm.ack_status = payload.get("ack_status", "PENDING")
        hm.notes = payload.get("notes")
        hm.balance_payment_date = payload.get("balance_payment_date")

    _sync_lr_financials(hm, session)
    hm.balance = calculate_balance(hm.total_amount, hm.advance_cash, hm.advance_bank)


def create_hirememo(db: Session, payload: dict):
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
        existing = db.query(HireMemoModel).filter(HireMemoModel.lr_id == lr_id).first()

    if existing:
        _apply_payload(existing, payload, db, partial=False)
        existing.financial_year = fy
        hm = existing
    else:
        hm = HireMemoModel(lr_id=lr_id)
        _apply_payload(hm, payload, db, partial=False)
        hm.financial_year = fy
        # Auto-assign hire memo sequence scoped to financial year.
        seq = _next_hirememo_seq(db, fy)
        hm.hire_memo_no = str(seq)

    try:
        db.add(hm)
        db.flush()
        _sync_hirememo_advance_vouchers(
            db,
            hirememo_id=hm.id,
            hirememo_no=hm.hire_memo_no,
            hirememo_date=hm.hire_memo_date,
            advance_cash=float(hm.advance_cash or 0),
            advance_bank=float(hm.advance_bank or 0),
        )
        log_action(db, "HireMemo", hm.id, "CREATE", after=_hm_to_dict(hm))
        db.commit()
        db.refresh(hm)
        return hm
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise ValueError(f"Failed to create HireMemo: {str(e)}")


def update_hirememo(db: Session, hm_id: int, payload: dict):
    hm = db.query(HireMemoModel).filter(HireMemoModel.id == hm_id).first()
    if not hm:
        return None
    before = _hm_to_dict(hm)
    _apply_payload(hm, payload, db, partial=True)
    db.flush()
    _sync_hirememo_advance_vouchers(
        db,
        hirememo_id=hm.id,
        hirememo_no=hm.hire_memo_no,
        hirememo_date=hm.hire_memo_date,
        advance_cash=float(hm.advance_cash or 0),
        advance_bank=float(hm.advance_bank or 0),
    )
    log_action(db, "HireMemo", hm_id, "UPDATE", before=before, after=_hm_to_dict(hm))
    db.commit()
    db.refresh(hm)
    return hm
