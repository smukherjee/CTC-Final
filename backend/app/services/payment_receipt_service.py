from datetime import date
from typing import List, Optional

from ..core.financial_year_utils import fy_from_date as _fy_from_date
from ..db import SessionLocal
from ..models.payment_receipt import PaymentReceiptModel


def _to_dict(row: PaymentReceiptModel) -> dict:
    return {
        "id": row.id,
        "payment_date": row.payment_date,
        "amount": float(row.amount) if row.amount is not None else 0.0,
        "received_from": row.received_from,
        "financial_year": row.financial_year,
        "notes": row.notes,
        "created_at": row.created_at,
    }


def create(payload: dict) -> dict:
    session = SessionLocal()
    try:
        payment_date = payload.get("payment_date") or date.today()
        fy = payload.get("financial_year") or _fy_from_date(payment_date)
        row = PaymentReceiptModel(
            payment_date=payment_date,
            amount=payload.get("amount", 0),
            received_from=payload.get("received_from"),
            financial_year=fy,
            notes=payload.get("notes"),
        )
        session.add(row)
        session.commit()
        session.refresh(row)
        return _to_dict(row)
    finally:
        session.close()


def list_receipts(fy: Optional[str] = None) -> List[dict]:
    session = SessionLocal()
    try:
        query = session.query(PaymentReceiptModel)
        if fy:
            query = query.filter(PaymentReceiptModel.financial_year == fy)
        rows = query.order_by(PaymentReceiptModel.payment_date.desc(), PaymentReceiptModel.id.desc()).all()
        return [_to_dict(row) for row in rows]
    finally:
        session.close()


def update(receipt_id: int, payload: dict) -> Optional[dict]:
    session = SessionLocal()
    try:
        row = session.query(PaymentReceiptModel).filter(PaymentReceiptModel.id == receipt_id).first()
        if not row:
            return None

        for key in ("payment_date", "amount", "received_from", "financial_year", "notes"):
            if key in payload:
                setattr(row, key, payload[key])

        if ("payment_date" in payload or "financial_year" in payload) and not payload.get("financial_year"):
            row.financial_year = _fy_from_date(row.payment_date)

        session.commit()
        session.refresh(row)
        return _to_dict(row)
    finally:
        session.close()


def delete(receipt_id: int) -> bool:
    session = SessionLocal()
    try:
        deleted = session.query(PaymentReceiptModel).filter(PaymentReceiptModel.id == receipt_id).delete()
        session.commit()
        return bool(deleted)
    finally:
        session.close()
