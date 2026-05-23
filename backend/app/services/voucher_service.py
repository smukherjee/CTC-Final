from datetime import date
from typing import List, Optional

from sqlalchemy.orm import Session

from ..core.financial_year_utils import fy_from_date as _fy_from_date
from ..models.voucher import VoucherModel


def _to_dict(row: VoucherModel) -> dict:
    return {
        "id": row.id,
        "voucher_type": row.voucher_type,
        "reference_id": row.reference_id,
        "reference_type": row.reference_type,
        "amount": float(row.amount) if row.amount is not None else 0.0,
        "narration": row.narration,
        "date": row.date,
        "financial_year": row.financial_year,
        "created_at": row.created_at,
    }


def _upsert_reference_voucher(
    session,
    *,
    voucher_type: str,
    reference_id: int,
    reference_type: str,
    amount: float,
    narration: str,
    voucher_date: date,
    financial_year: str,
) -> None:
    existing = (
        session.query(VoucherModel)
        .filter(
            VoucherModel.reference_id == reference_id,
            VoucherModel.reference_type == reference_type,
        )
        .first()
    )

    if amount <= 0:
        if existing:
            session.delete(existing)
        return

    if existing:
        existing.voucher_type = voucher_type
        existing.amount = amount
        existing.narration = narration
        existing.date = voucher_date
        existing.financial_year = financial_year
        session.add(existing)
        return

    session.add(
        VoucherModel(
            voucher_type=voucher_type,
            reference_id=reference_id,
            reference_type=reference_type,
            amount=amount,
            narration=narration,
            date=voucher_date,
            financial_year=financial_year,
        )
    )


def sync_hirememo_advance_vouchers(
    session,
    *,
    hirememo_id: int,
    hirememo_no: Optional[str],
    hirememo_date: Optional[date],
    advance_cash: float,
    advance_bank: float,
) -> None:
    voucher_date = hirememo_date or date.today()
    financial_year = _fy_from_date(voucher_date)
    hm_label = f"HM {hirememo_no}" if hirememo_no else f"HM #{hirememo_id}"

    _upsert_reference_voucher(
        session,
        voucher_type="cash_debit",
        reference_id=hirememo_id,
        reference_type="HIREMEMO_ADVANCE_CASH",
        amount=float(advance_cash or 0),
        narration=f"Advance cash paid for {hm_label}",
        voucher_date=voucher_date,
        financial_year=financial_year,
    )
    _upsert_reference_voucher(
        session,
        voucher_type="bank_debit",
        reference_id=hirememo_id,
        reference_type="HIREMEMO_ADVANCE_BANK",
        amount=float(advance_bank or 0),
        narration=f"Advance bank paid for {hm_label}",
        voucher_date=voucher_date,
        financial_year=financial_year,
    )


def list_vouchers(db: Session, book: Optional[str] = None, fy: Optional[str] = None) -> List[dict]:
    query = db.query(VoucherModel)
    if fy:
        query = query.filter(VoucherModel.financial_year == fy)
    if book == "cash":
        query = query.filter(VoucherModel.voucher_type.ilike("cash_%"))
    elif book == "bank":
        query = query.filter(VoucherModel.voucher_type.ilike("bank_%"))
    rows = query.order_by(VoucherModel.date.asc(), VoucherModel.id.asc()).all()
    return [_to_dict(row) for row in rows]
