from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.financial_year_utils import fy_from_date as _fy_from_date
from ..models.invoice import InvoiceModel
from ..models.client import ClientModel
from ..models.payment_receipt import PaymentReceiptModel
from .billing_service import sync_invoice_payment_status
from .audit_service import log_action


def _as_decimal(value, default: str = "0") -> Decimal:
    if value is None or value == "":
        return Decimal(default)
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _compute_net_amount(total_billed_amount: Decimal, tds_deducted: Decimal, other_deduction: Decimal) -> Decimal:
    return (total_billed_amount - tds_deducted - other_deduction).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _resolve_received_from(session, payload: dict, existing: Optional[PaymentReceiptModel] = None) -> tuple[Optional[int], str]:
    received_from_id = payload.get("received_from_id")
    received_from = (payload.get("received_from") or "").strip()

    if received_from_id is not None:
        client = session.query(ClientModel).filter(ClientModel.id == int(received_from_id)).first()
        if not client:
            raise ValueError("Received from customer not found")
        return client.id, client.name

    if received_from:
        client = session.query(ClientModel).filter(ClientModel.name == received_from).first()
        return (client.id if client else None), received_from

    if existing and existing.received_from:
        return existing.received_from_id, existing.received_from

    raise ValueError("Received from customer is required")


def _resolve_invoice(session, payload: dict, existing: Optional[PaymentReceiptModel] = None) -> Optional[InvoiceModel]:
    invoice_id = payload.get("invoice_id")
    if invoice_id is None and existing is not None:
        invoice_id = existing.invoice_id
    if invoice_id in (None, ""):
        return None
    invoice = session.query(InvoiceModel).filter(InvoiceModel.id == int(invoice_id)).first()
    if not invoice:
        raise ValueError("Linked invoice not found")
    return invoice


def _extract_amounts(payload: dict, existing: Optional[PaymentReceiptModel] = None) -> tuple[Decimal, Decimal, Decimal, Decimal]:
    total_billed_amount = _as_decimal(
        payload.get("total_billed_amount", existing.total_billed_amount if existing else payload.get("amount", 0))
    )
    tds_deducted = _as_decimal(payload.get("tds_deducted", existing.tds_deducted if existing else 0))
    other_deduction = _as_decimal(payload.get("other_deduction", existing.other_deduction if existing else 0))
    if payload.get("net_amount") is not None:
        net_amount = _as_decimal(payload.get("net_amount"))
    else:
        net_amount = _compute_net_amount(total_billed_amount, tds_deducted, other_deduction)
    return total_billed_amount, tds_deducted, other_deduction, net_amount


def _to_dict(row: PaymentReceiptModel) -> dict:
    return {
        "id": row.id,
        "payment_date": row.payment_date,
        "invoice_id": row.invoice_id,
        "received_from_id": row.received_from_id,
        "received_from": row.received_from,
        "total_billed_amount": float(row.total_billed_amount) if row.total_billed_amount is not None else 0.0,
        "tds_deducted": float(row.tds_deducted) if row.tds_deducted is not None else 0.0,
        "net_amount": float(row.net_amount) if row.net_amount is not None else 0.0,
        "other_deduction": float(row.other_deduction) if row.other_deduction is not None else 0.0,
        "deduction_remarks": row.deduction_remarks,
        "payment_mode": row.payment_mode,
        "financial_year": row.financial_year,
        "created_at": row.created_at,
    }


def create(db: Session, payload: dict) -> dict:
    try:
        payment_date = payload.get("payment_date") or date.today()
        invoice = _resolve_invoice(db, payload)
        fy = payload.get("financial_year") or (invoice.financial_year if invoice else _fy_from_date(payment_date))
        received_from_id, received_from = _resolve_received_from(db, payload)
        total_billed_amount, tds_deducted, other_deduction, net_amount = _extract_amounts(payload)

        if invoice is not None:
            if int(invoice.client_id) != int(received_from_id):
                raise ValueError("Selected invoice does not belong to the chosen customer")
            current_received = db.query(func.coalesce(func.sum(PaymentReceiptModel.net_amount), 0)).filter(
                PaymentReceiptModel.invoice_id == invoice.id
            ).scalar()
            max_receivable = _as_decimal(invoice.net_amount or invoice.total_amount or 0)
            if _as_decimal(current_received) + net_amount > max_receivable + Decimal("0.01"):
                raise ValueError("Receipt exceeds the invoice outstanding balance")

        row = PaymentReceiptModel(
            payment_date=payment_date,
            amount=net_amount,
            invoice_id=invoice.id if invoice else None,
            received_from_id=received_from_id,
            received_from=received_from,
            total_billed_amount=total_billed_amount,
            tds_deducted=tds_deducted,
            net_amount=net_amount,
            other_deduction=other_deduction,
            deduction_remarks=payload.get("deduction_remarks"),
            payment_mode=(payload.get("payment_mode") or "BANK").strip().upper(),
            financial_year=fy,
            notes=payload.get("notes"),
        )
        db.add(row)
        db.flush()
        if invoice is not None:
            sync_invoice_payment_status(db, invoice)
        log_action(db, "PaymentReceipt", row.id, "CREATE", after=_to_dict(row))
        db.commit()
        db.refresh(row)
        return _to_dict(row)
    except Exception:
        db.rollback()
        raise


def list_receipts(db: Session, fy: Optional[str] = None) -> List[dict]:
    query = db.query(PaymentReceiptModel)
    if fy:
        query = query.filter(PaymentReceiptModel.financial_year == fy)
    rows = query.order_by(PaymentReceiptModel.payment_date.desc(), PaymentReceiptModel.id.desc()).all()
    return [_to_dict(row) for row in rows]


def update(db: Session, receipt_id: int, payload: dict) -> Optional[dict]:
    try:
        row = db.query(PaymentReceiptModel).filter(PaymentReceiptModel.id == receipt_id).first()
        if not row:
            return None

        before = _to_dict(row)
        previous_invoice_id = row.invoice_id

        if "payment_date" in payload:
            row.payment_date = payload["payment_date"]

        if "invoice_id" in payload:
            invoice = _resolve_invoice(db, payload, existing=row)
            row.invoice_id = invoice.id if invoice else None
        else:
            invoice = _resolve_invoice(db, payload, existing=row)

        if any(key in payload for key in ("received_from_id", "received_from")):
            row.received_from_id, row.received_from = _resolve_received_from(db, payload, existing=row)

        if any(key in payload for key in ("total_billed_amount", "tds_deducted", "other_deduction", "net_amount", "amount")):
            total_billed_amount, tds_deducted, other_deduction, net_amount = _extract_amounts(payload, existing=row)
            row.total_billed_amount = total_billed_amount
            row.tds_deducted = tds_deducted
            row.other_deduction = other_deduction
            row.net_amount = net_amount
            row.amount = net_amount

        if "deduction_remarks" in payload:
            row.deduction_remarks = payload["deduction_remarks"]

        if "payment_mode" in payload:
            row.payment_mode = (payload.get("payment_mode") or "BANK").strip().upper()

        if "financial_year" in payload:
            row.financial_year = payload["financial_year"]

        if "notes" in payload:
            row.notes = payload["notes"]

        if ("payment_date" in payload or "financial_year" in payload) and not payload.get("financial_year"):
            row.financial_year = _fy_from_date(row.payment_date)

        if invoice is not None:
            if row.received_from_id is None or int(invoice.client_id) != int(row.received_from_id):
                raise ValueError("Selected invoice does not belong to the chosen customer")
            existing_receipts = db.query(func.coalesce(func.sum(PaymentReceiptModel.net_amount), 0)).filter(
                PaymentReceiptModel.invoice_id == invoice.id,
                PaymentReceiptModel.id != row.id,
            ).scalar()
            max_receivable = _as_decimal(invoice.net_amount or invoice.total_amount or 0)
            if _as_decimal(existing_receipts) + _as_decimal(row.net_amount) > max_receivable + Decimal("0.01"):
                raise ValueError("Receipt exceeds the invoice outstanding balance")

        if previous_invoice_id and previous_invoice_id != row.invoice_id:
            previous_invoice = db.query(InvoiceModel).filter(InvoiceModel.id == previous_invoice_id).first()
            if previous_invoice:
                sync_invoice_payment_status(db, previous_invoice)
        if invoice is not None:
            sync_invoice_payment_status(db, invoice)
        log_action(db, "PaymentReceipt", row.id, "UPDATE", before=before, after=_to_dict(row))
        db.commit()
        db.refresh(row)
        return _to_dict(row)
    except Exception:
        db.rollback()
        raise


def delete(db: Session, receipt_id: int) -> bool:
    try:
        row = db.query(PaymentReceiptModel).filter(PaymentReceiptModel.id == receipt_id).first()
        if not row:
            return False
        before = _to_dict(row)
        invoice_id = row.invoice_id
        db.delete(row)
        if invoice_id:
            invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
            if invoice:
                sync_invoice_payment_status(db, invoice)
        log_action(db, "PaymentReceipt", receipt_id, "DELETE", before=before)
        db.commit()
        return True
    except Exception:
        db.rollback()
        raise
