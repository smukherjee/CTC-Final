from datetime import date
from decimal import Decimal
from typing import List, Optional

from ..core.financial_year_utils import (
    format_invoice_no as _format_invoice_no,
    fy_from_date as _fy_from_date,
    next_invoice_seq as _next_invoice_seq,
)
from ..db import SessionLocal
from ..models.invoice import InvoiceLineModel, InvoiceModel


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


def _line_to_dict(line: InvoiceLineModel) -> dict:
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
        "total": _to_float(line.total),
    }


def _invoice_to_dict(invoice: InvoiceModel, lines: List[InvoiceLineModel]) -> dict:
    return {
        "id": invoice.id,
        "invoice_no": invoice.invoice_no,
        "invoice_date": invoice.invoice_date,
        "party_id": invoice.party_id,
        "financial_year": invoice.financial_year,
        "po_no": invoice.po_no,
        "po_date": invoice.po_date,
        "hsn_code": invoice.hsn_code,
        "reverse_charge": bool(invoice.reverse_charge),
        "gst_paid_by": invoice.gst_paid_by,
        "total_amount": _to_float(invoice.total_amount) or 0,
        "tds_amount": _to_float(invoice.tds_amount) or 0,
        "net_amount": _to_float(invoice.net_amount) or 0,
        "status": invoice.status,
        "lines": [_line_to_dict(line) for line in lines],
    }


def _create_line(invoice_id: int, item: dict) -> InvoiceLineModel:
    return InvoiceLineModel(
        invoice_id=invoice_id,
        lr_id=item.get("lr_id"),
        s_no=item.get("s_no"),
        lr_no=item.get("lr_no"),
        lr_date=_as_date(item.get("lr_date")),
        qty=item.get("qty"),
        particulars=item.get("particulars"),
        v_type=item.get("v_type"),
        vehicle_no=item.get("vehicle_no"),
        consignor=item.get("consignor"),
        consignee=item.get("consignee"),
        from_city=item.get("from_city"),
        to_city=item.get("to_city"),
        freight=item.get("freight", 0),
        loading_detention=item.get("loading_detention", 0),
        unloading_charges=item.get("unloading_charges", 0),
        unloading_detention=item.get("unloading_detention", 0),
        other_charges=item.get("other_charges", 0),
        total=item.get("total", 0),
    )


def list_invoices(fy: Optional[str] = None, party_id: Optional[int] = None) -> List[dict]:
    session = SessionLocal()
    try:
        query = session.query(InvoiceModel)
        if fy:
            query = query.filter(InvoiceModel.financial_year == fy)
        if party_id is not None:
            query = query.filter(InvoiceModel.party_id == party_id)
        invoices = query.order_by(InvoiceModel.id.desc()).all()

        payload = []
        for invoice in invoices:
            lines = session.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all()
            payload.append(_invoice_to_dict(invoice, lines))
        return payload
    finally:
        session.close()


def get_invoice(invoice_id: int) -> Optional[dict]:
    session = SessionLocal()
    try:
        invoice = session.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
        if not invoice:
            return None
        lines = session.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all()
        return _invoice_to_dict(invoice, lines)
    finally:
        session.close()


def create_invoice(payload: dict) -> dict:
    session = SessionLocal()
    try:
        invoice_date = _as_date(payload.get("invoice_date")) or date.today()
        fy = payload.get("financial_year") or _fy_from_date(invoice_date)
        total_amount = float(payload.get("total_amount") or 0)
        tds_amount = float(payload.get("tds_amount") or 0)
        net_amount = total_amount - tds_amount

        seq = _next_invoice_seq(session, fy)
        invoice_no = _format_invoice_no(seq, fy)

        invoice = InvoiceModel(
            invoice_no=invoice_no,
            invoice_date=invoice_date,
            party_id=payload["party_id"],
            financial_year=fy,
            po_no=payload.get("po_no"),
            po_date=_as_date(payload.get("po_date")),
            hsn_code=payload.get("hsn_code") or "996791",
            reverse_charge=bool(payload.get("reverse_charge", False)),
            gst_paid_by=payload.get("gst_paid_by"),
            total_amount=total_amount,
            tds_amount=tds_amount,
            net_amount=net_amount,
            status=payload.get("status") or "draft",
        )
        session.add(invoice)
        session.flush()

        for item in payload.get("lines", []):
            session.add(_create_line(invoice.id, item))

        session.commit()
        session.refresh(invoice)
        lines = session.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all()
        return _invoice_to_dict(invoice, lines)
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_invoice(invoice_id: int, payload: dict) -> Optional[dict]:
    session = SessionLocal()
    try:
        invoice = session.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
        if not invoice:
            return None

        for key in (
            "party_id",
            "po_no",
            "gst_paid_by",
            "hsn_code",
            "status",
            "financial_year",
            "reverse_charge",
        ):
            if key in payload:
                setattr(invoice, key, payload[key])

        if "invoice_date" in payload:
            invoice.invoice_date = _as_date(payload.get("invoice_date")) or invoice.invoice_date
        if "po_date" in payload:
            invoice.po_date = _as_date(payload.get("po_date"))

        if "total_amount" in payload or "tds_amount" in payload or "net_amount" in payload:
            total_amount = float(payload.get("total_amount", _to_float(invoice.total_amount) or 0))
            tds_amount = float(payload.get("tds_amount", _to_float(invoice.tds_amount) or 0))
            net_amount = float(payload.get("net_amount", total_amount - tds_amount))
            invoice.total_amount = total_amount
            invoice.tds_amount = tds_amount
            invoice.net_amount = net_amount

        if "lines" in payload and payload["lines"] is not None:
            session.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).delete()
            for item in payload["lines"]:
                session.add(_create_line(invoice.id, item))

        session.commit()
        session.refresh(invoice)
        lines = session.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == invoice.id).all()
        return _invoice_to_dict(invoice, lines)
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def delete_invoice(invoice_id: int) -> bool:
    session = SessionLocal()
    try:
        deleted = session.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).delete()
        session.commit()
        return bool(deleted)
    finally:
        session.close()
