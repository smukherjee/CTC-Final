from datetime import date
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.financial_year_utils import (
    format_invoice_no as _format_invoice_no,
    fy_from_date as _fy_from_date,
    next_invoice_seq as _next_invoice_seq,
)
from ..models.audit_log import AuditLogModel
from ..models.invoice import InvoiceLineModel, InvoiceModel
from ..models.lr import LRModel, LRDeductionModel
from ..models.payment_receipt import PaymentReceiptModel
from ..core.amount_in_words import inr_words
from .audit_service import log_action
from .billing_computations import compute_net_amount, compute_outstanding, derive_payment_status


def _to_float(value) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def _as_date(value) -> Optional[date]:
    if value is None or isinstance(value, date):
        return value
    if isinstance(value, str) and value.strip():
        return date.fromisoformat(value)
    return None


def _get_deductions_by_lr(db: Session, lr_ids: list[int]) -> dict[int, list[dict]]:
    if not lr_ids:
        return {}
    rows = (
        db.query(LRDeductionModel)
        .filter(LRDeductionModel.lr_id.in_(lr_ids))
        .order_by(LRDeductionModel.lr_id.asc(), LRDeductionModel.sort_order.asc(), LRDeductionModel.id.asc())
        .all()
    )
    grouped: dict[int, list[dict]] = {}
    for row in rows:
        key = int(row.lr_id)
        grouped.setdefault(key, []).append(
            {
                "label": row.deduction_label,
                "amount": _to_float(row.deduction_amount) or 0.0,
            }
        )
    return grouped


def _line_to_dict(line: InvoiceLineModel, deductions_by_lr: dict[int, list[dict]] | None = None) -> dict:
    lr_id = int(line.lr_id) if line.lr_id is not None else None
    line_total = _to_float(line.total) or 0.0
    return {
        "id": line.id,
        "invoice_id": line.invoice_id,
        "lr_id": line.lr_id,
        "s_no": line.s_no,
        "lr_no": line.lr_no,
        "lr_date": line.lr_date,
        "qty": _to_float(line.qty),
        "particulars": line.particulars,
        "v_type": line.v_type,
        "vehicle_no": line.vehicle_no,
        "consignor": line.consignor,
        "consignee": line.consignee,
        "from_city": line.from_city,
        "to_city": line.to_city,
        "freight": _to_float(line.freight),
        "loading_detention": _to_float(line.loading_detention),
        "unloading_charges": _to_float(line.unloading_charges),
        "unloading_detention": _to_float(line.unloading_detention),
        "other_charges": _to_float(line.other_charges),
        "total": line_total,
        "line_amount": line_total,
        "deductions": deductions_by_lr.get(lr_id, []) if deductions_by_lr and lr_id else [],
    }


def compute_invoice_receipt_summary(session, invoice_id: int) -> tuple[float, float]:
    receipt_total = (
        session.query(func.coalesce(func.sum(PaymentReceiptModel.net_amount), 0))
        .filter(PaymentReceiptModel.invoice_id == invoice_id)
        .scalar()
    )
    amount_received = _to_float(receipt_total) or 0.0
    invoice = session.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if not invoice:
        return amount_received, 0.0
    invoice_net = _to_float(invoice.net_amount) or _to_float(invoice.total_amount) or 0.0
    outstanding_amount = max(invoice_net - amount_received, 0.0)
    return amount_received, outstanding_amount


def sync_invoice_payment_status(session, invoice: InvoiceModel) -> InvoiceModel:
    amount_received, _outstanding = compute_invoice_receipt_summary(session, invoice.id)
    invoice_net = _to_float(invoice.net_amount) or _to_float(invoice.total_amount) or 0.0
    invoice.status = derive_payment_status(invoice.status, invoice_net, amount_received)
    return invoice


def _invoice_edit_hint(db: Session, invoice: InvoiceModel) -> tuple[bool, Optional[object], Optional[str]]:
    """Return edited flag, timestamp, and editor for invoice register hints."""
    try:
        audit_row = (
            db.query(AuditLogModel)
            .filter(
                AuditLogModel.entity_id == invoice.id,
                AuditLogModel.action == "UPDATE",
                AuditLogModel.entity_type.in_(["Invoice", "INVOICE", "invoice"]),
            )
            .order_by(AuditLogModel.created_at.desc(), AuditLogModel.id.desc())
            .first()
        )
    except Exception:
        audit_row = None

    if audit_row:
        return True, audit_row.created_at, audit_row.user_name or "system"

    edited_at = invoice.updated_at
    created_at = invoice.created_at
    if edited_at and created_at and edited_at > created_at:
        return True, edited_at, "system"

    return False, None, None


def _invoice_to_dict(db: Session, invoice: InvoiceModel, lines: List[InvoiceLineModel]) -> dict:
    amount_received, outstanding_amount = compute_invoice_receipt_summary(db, invoice.id)
    edited, edited_at, edited_by = _invoice_edit_hint(db, invoice)
    lr_ids = [int(line.lr_id) for line in lines if line.lr_id is not None]
    deductions_by_lr = _get_deductions_by_lr(db, lr_ids)
    gross_amount = _to_float(invoice.total_amount) or 0
    tds_amount = _to_float(invoice.tds_amount) or 0
    net_amount = compute_net_amount(gross_amount, tds_amount)
    return {
        "id": invoice.id,
        "invoice_no": invoice.invoice_no,
        "invoice_date": invoice.invoice_date,
        "client_id": invoice.client_id,
        "financial_year": invoice.financial_year,
        "po_no": invoice.po_no,
        "po_date": invoice.po_date,
        "hsn_code": invoice.hsn_code,
        "tax_on_reverse_charge": bool(invoice.reverse_charge),
        "reverse_charge": bool(invoice.reverse_charge),
        "gst_paid_by": invoice.gst_paid_by,
        "gross_amount": gross_amount,
        "total_amount": gross_amount,
        "tds_amount": tds_amount,
        "net_amount": net_amount,
        "amount_received": amount_received,
        "outstanding_amount": outstanding_amount,
        "status": invoice.status,
        "edited": edited,
        "edited_at": edited_at,
        "edited_by": edited_by,
        "lines": [_line_to_dict(line, deductions_by_lr=deductions_by_lr) for line in lines],
    }


def _create_line_from_lr(db: Session, invoice_id: int, item: dict, s_no: int) -> InvoiceLineModel:
    lr_id = int(item.get("lr_id") or 0)
    if lr_id <= 0:
        raise ValueError("Each invoice line requires a valid lr_id")
    lr = db.query(LRModel).filter(LRModel.id == lr_id).first()
    if not lr:
        raise ValueError(f"LR not found: {lr_id}")

    line_amount = _to_float(lr.total) or 0.0
    return InvoiceLineModel(
        invoice_id=invoice_id,
        lr_id=lr_id,
        s_no=s_no,
        lr_no=lr.lr_number,
        lr_date=lr.date,
        qty=1,
        particulars="Transport Service",
        v_type=lr.vehicle_type,
        vehicle_no=lr.vehicle_number,
        consignor=lr.consignor_name,
        consignee=lr.consignee_name,
        from_city=lr.origin,
        to_city=lr.destination,
        freight=line_amount,
        loading_detention=0,
        unloading_charges=0,
        unloading_detention=0,
        other_charges=0,
        total=line_amount,
    )


def list_invoices(db: Session, fy: Optional[str] = None, client_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[dict]:
    query = db.query(InvoiceModel)
    if fy:
        query = query.filter(InvoiceModel.financial_year == fy)
    if client_id is not None:
        query = query.filter(InvoiceModel.client_id == client_id)
    invoices = query.order_by(InvoiceModel.id.desc()).offset(skip).limit(limit).all()

    payload = []
    for invoice in invoices:
        lines = db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all()
        payload.append(_invoice_to_dict(db, invoice, lines))
    return payload


def get_invoice(db: Session, invoice_id: int) -> Optional[dict]:
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if not invoice:
        return None
    lines = db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all()
    return _invoice_to_dict(db, invoice, lines)


def create_invoice(db: Session, payload: dict) -> dict:
    try:
        invoice_date = _as_date(payload.get("invoice_date")) or date.today()
        fy = payload.get("financial_year") or _fy_from_date(invoice_date)
        lines_payload = payload.get("lines") or []
        if not lines_payload:
            raise ValueError("At least one LR is required to create an invoice")

        tds_amount = float(payload.get("tds_amount") or 0)

        seq = _next_invoice_seq(db, fy)
        invoice_no = _format_invoice_no(seq, fy)

        invoice = InvoiceModel(
            invoice_no=invoice_no,
            invoice_date=invoice_date,
            client_id=payload["client_id"],
            financial_year=fy,
            po_no=payload.get("po_no"),
            po_date=_as_date(payload.get("po_date")),
            hsn_code=payload.get("hsn_code") or "996791",
            reverse_charge=bool(payload.get("tax_on_reverse_charge", payload.get("reverse_charge", False))),
            gst_paid_by=payload.get("gst_paid_by"),
            total_amount=0,
            tds_amount=tds_amount,
            net_amount=0,
            status=payload.get("status") or "issued",
        )
        db.add(invoice)
        db.flush()

        line_total = 0.0
        for idx, item in enumerate(lines_payload, start=1):
            line = _create_line_from_lr(db, invoice.id, item, s_no=idx)
            line_total += _to_float(line.total) or 0.0
            db.add(line)

        invoice.total_amount = line_total
        invoice.net_amount = compute_net_amount(line_total, tds_amount)

        sync_invoice_payment_status(db, invoice)
        after = _invoice_to_dict(db, invoice, db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all())
        log_action(db, "Invoice", invoice.id, "CREATE", after=after)
        db.commit()
        db.refresh(invoice)
        lines = db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all()
        return _invoice_to_dict(db, invoice, lines)
    except Exception:
        db.rollback()
        raise


def update_invoice(db: Session, invoice_id: int, payload: dict) -> Optional[dict]:
    try:
        invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
        if not invoice:
            return None
        amount_received, _ = compute_invoice_receipt_summary(db, invoice.id)
        invoice_net = _to_float(invoice.net_amount) or _to_float(invoice.total_amount) or 0.0
        if derive_payment_status(invoice.status, invoice_net, amount_received) == "paid":
            raise ValueError("Paid invoices cannot be edited")
        before = _invoice_to_dict(db, invoice, db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all())

        for key in (
            "client_id",
            "po_no",
            "gst_paid_by",
            "hsn_code",
            "status",
            "financial_year",
        ):
            if key in payload:
                setattr(invoice, key, payload[key])
        if "tax_on_reverse_charge" in payload:
            invoice.reverse_charge = bool(payload.get("tax_on_reverse_charge"))
        elif "reverse_charge" in payload:
            invoice.reverse_charge = bool(payload.get("reverse_charge"))

        if "invoice_date" in payload:
            invoice.invoice_date = _as_date(payload.get("invoice_date")) or invoice.invoice_date
        if "po_date" in payload:
            invoice.po_date = _as_date(payload.get("po_date"))

        if "lines" in payload and payload["lines"] is not None:
            db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).delete()
            line_total = 0.0
            for idx, item in enumerate(payload["lines"], start=1):
                line = _create_line_from_lr(db, invoice.id, item, s_no=idx)
                line_total += _to_float(line.total) or 0.0
                db.add(line)
            invoice.total_amount = line_total

        if "tds_amount" in payload:
            invoice.tds_amount = float(payload.get("tds_amount") or 0)

        total_amount = _to_float(invoice.total_amount) or 0.0
        tds_amount = _to_float(invoice.tds_amount) or 0.0
        invoice.net_amount = compute_net_amount(total_amount, tds_amount)

        sync_invoice_payment_status(db, invoice)
        after = _invoice_to_dict(db, invoice, db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all())
        log_action(db, "Invoice", invoice.id, "UPDATE", before=before, after=after)
        db.commit()
        db.refresh(invoice)
        lines = db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all()
        return _invoice_to_dict(db, invoice, lines)
    except Exception:
        db.rollback()
        raise


def delete_invoice(db: Session, invoice_id: int) -> bool:
    try:
        invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
        if not invoice:
            return False
        before = _invoice_to_dict(db, invoice, db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all())
        db.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).delete()
        db.delete(invoice)
        log_action(db, "Invoice", invoice_id, "DELETE", before=before)
        db.commit()
        return True
    except Exception:
        db.rollback()
        raise


def get_invoice_print_data(db: Session, invoice_id: int) -> Optional[dict]:
    invoice_payload = get_invoice(db, invoice_id)
    if not invoice_payload:
        return None

    less_totals: dict[str, float] = {}
    for line in invoice_payload.get("lines", []):
        for deduction in line.get("deductions", []):
            label = str(deduction.get("label") or "LESS").strip() or "LESS"
            amount = float(deduction.get("amount") or 0)
            less_totals[label] = less_totals.get(label, 0.0) + amount

    less_lines = [
        {"label": label, "amount": amount}
        for label, amount in less_totals.items()
    ]

    return {
        "invoice": invoice_payload,
        "amount_in_words": inr_words(invoice_payload.get("net_amount") or 0),
        "less_lines": less_lines,
    }
