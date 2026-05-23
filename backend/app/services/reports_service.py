from datetime import date, datetime, timedelta
from typing import Optional

from sqlalchemy import String, and_, cast, func, or_
from sqlalchemy.orm import Session

from .lr_service import get_eway_expiring
from ..models.audit_log import AuditLogModel
from ..models.client import ClientModel
from ..models.contract import ContractModel
from ..models.hirememo import HireMemoModel
from ..models.invoice import InvoiceLineModel, InvoiceModel
from ..models.lr import LRModel
from ..models.payment_receipt import PaymentReceiptModel
from ..models.voucher import VoucherModel


def _to_float(value: object) -> float:
    return float(value or 0)


def _money(value: object) -> float:
    return round(_to_float(value), 2)


def _apply_fy_filter(query, model, fy: Optional[str]):
    if fy:
        query = query.filter(model.financial_year == fy)
    return query


def _normalize_filter_text(value: Optional[str], lower: bool = False) -> Optional[str]:
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    return cleaned.lower() if lower else cleaned


def _parse_filter_date(value: Optional[str]) -> Optional[date]:
    cleaned = _normalize_filter_text(value)
    if not cleaned:
        return None
    try:
        return datetime.strptime(cleaned, "%Y-%m-%d").date()
    except ValueError:
        return None


def parse_report_filters(
    *,
    fy: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    entity: Optional[str] = None,
    role: Optional[str] = None,
) -> dict:
    """Normalize common report filters in one place.

    This keeps API handlers and report services aligned on FY/date/entity/role
    semantics without duplicating trim/parse logic.
    """
    parsed_from = _parse_filter_date(date_from)
    parsed_to = _parse_filter_date(date_to)

    if parsed_from and parsed_to and parsed_from > parsed_to:
        parsed_from, parsed_to = parsed_to, parsed_from

    return {
        "fy": _normalize_filter_text(fy),
        "date_from": parsed_from,
        "date_to": parsed_to,
        "entity": _normalize_filter_text(entity),
        "role": _normalize_filter_text(role, lower=True),
    }


def _days_between(base_date: Optional[date], ref: date) -> int:
    if not base_date:
        return 0
    return max((ref - base_date).days, 0)


def get_eway_expiry_alerts(db: Session, hours: int = 8, months: Optional[int] = None) -> list[dict]:
    """Return E-way alerts for undelivered LRs using the shared LR alert logic."""
    return get_eway_expiring(db, hours=hours, months=months)


def get_pending_billing_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    filters = parse_report_filters(fy=fy)
    fy = filters["fy"]
    cutoff = date.today() - timedelta(days=15)
    rows = (
        db.query(LRModel)
        .outerjoin(InvoiceLineModel, InvoiceLineModel.lr_id == LRModel.id)
        .filter(
            LRModel.pod_received.is_(True),
            LRModel.date.isnot(None),
            LRModel.date < cutoff,
            InvoiceLineModel.id.is_(None),
        )
        .order_by(LRModel.date.asc(), LRModel.id.asc())
    )
    if fy:
        rows = rows.filter(LRModel.financial_year == fy)
    rows = rows.all()
    return [
        {
            "lr_id": row.id,
            "lr_number": row.lr_number,
            "date": row.date,
            "vehicle_number": row.vehicle_number,
            "consignor_name": row.consignor_name,
            "consignee_name": row.consignee_name,
            "origin": row.origin,
            "destination": row.destination,
        }
        for row in rows
    ]


def get_outstanding_receivables_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    filters = parse_report_filters(fy=fy)
    fy = filters["fy"]
    rows = (
        db.query(
            InvoiceModel,
            ClientModel,
            func.coalesce(func.sum(PaymentReceiptModel.net_amount), 0).label("amount_received"),
        )
        .outerjoin(ClientModel, ClientModel.id == InvoiceModel.client_id)
        .outerjoin(PaymentReceiptModel, PaymentReceiptModel.invoice_id == InvoiceModel.id)
        .group_by(InvoiceModel.id, ClientModel.id)
    )
    if fy:
        rows = rows.filter(InvoiceModel.financial_year == fy)
    rows = rows.all()

    grouped: dict[int, dict] = {}
    for invoice, client, amount_received in rows:
        outstanding = max(float(invoice.net_amount or invoice.total_amount or 0) - float(amount_received or 0), 0.0)
        if outstanding <= 0.009:
            continue
        key = int(invoice.client_id or 0)
        if key not in grouped:
            grouped[key] = {
                "client_id": key,
                "client_name": client.name if client else f"Client {key}",
                "invoice_count": 0,
                "outstanding_total": 0.0,
            }
        grouped[key]["invoice_count"] += 1
        grouped[key]["outstanding_total"] += outstanding

    return sorted(grouped.values(), key=lambda item: item["outstanding_total"], reverse=True)


def get_hirememo_register_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = db.query(HireMemoModel).order_by(HireMemoModel.hire_memo_date.desc(), HireMemoModel.id.desc())
    rows = _apply_fy_filter(rows, HireMemoModel, fy).all()
    return [
        {
            "hirememo_id": hm.id,
            "hire_memo_no": hm.hire_memo_no,
            "hire_memo_date": hm.hire_memo_date,
            "driver_name": hm.driver_name,
            "vehicle_number": hm.vehicle_number,
            "from_location": hm.from_location,
            "to_location": hm.to_location,
            "total_amount": _money(hm.total_amount),
            "advance_total": _money(_to_float(hm.advance_cash) + _to_float(hm.advance_bank)),
            "balance": _money(hm.balance),
            "financial_year": hm.financial_year,
        }
        for hm in rows
    ]


def get_advance_payment_register_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = db.query(HireMemoModel).order_by(HireMemoModel.advance_payment_date.desc(), HireMemoModel.id.desc())
    rows = _apply_fy_filter(rows, HireMemoModel, fy).all()
    return [
        {
            "hirememo_id": hm.id,
            "hire_memo_no": hm.hire_memo_no,
            "advance_payment_date": hm.advance_payment_date,
            "driver_name": hm.driver_name,
            "vehicle_number": hm.vehicle_number,
            "advance_cash": _money(hm.advance_cash),
            "advance_bank": _money(hm.advance_bank),
            "advance_total": _money(_to_float(hm.advance_cash) + _to_float(hm.advance_bank)),
            "financial_year": hm.financial_year,
        }
        for hm in rows
        if _to_float(hm.advance_cash) > 0 or _to_float(hm.advance_bank) > 0
    ]


def get_driver_settlement_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = db.query(HireMemoModel)
    rows = _apply_fy_filter(rows, HireMemoModel, fy).all()
    grouped: dict[str, dict] = {}
    for hm in rows:
        key = (hm.driver_name or "Unknown Driver").strip() or "Unknown Driver"
        item = grouped.setdefault(
            key,
            {
                "driver_name": key,
                "trip_count": 0,
                "total_freight": 0.0,
                "advance_total": 0.0,
                "balance_due": 0.0,
            },
        )
        item["trip_count"] += 1
        item["total_freight"] += _to_float(hm.total_amount)
        item["advance_total"] += _to_float(hm.advance_cash) + _to_float(hm.advance_bank)
        item["balance_due"] += _to_float(hm.balance)
    return sorted(grouped.values(), key=lambda r: r["balance_due"], reverse=True)


def get_driver_outstanding_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = [r for r in get_driver_settlement_rows(db, fy=fy) if _to_float(r.get("balance_due")) > 0]
    for row in rows:
        row["outstanding_amount"] = _money(row.get("balance_due"))
    return rows


def get_vendor_spend_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    lrs_query = db.query(LRModel)
    lrs_query = _apply_fy_filter(lrs_query, LRModel, fy)
    lrs = lrs_query.all()
    grouped: dict[str, dict] = {}
    for lr in lrs:
        vendor = (lr.through or "Unknown Vendor").strip() or "Unknown Vendor"
        item = grouped.setdefault(
            vendor,
            {"vendor_name": vendor, "trip_count": 0, "freight_total": 0.0, "amount_passed_total": 0.0},
        )
        item["trip_count"] += 1
        item["freight_total"] += _to_float(lr.total)
        item["amount_passed_total"] += _to_float(lr.amount_passed)
    return sorted(grouped.values(), key=lambda r: r["freight_total"], reverse=True)


def get_settlement_variance_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    invoice_q = db.query(InvoiceModel)
    invoice_q = _apply_fy_filter(invoice_q, InvoiceModel, fy)
    invoice_rows = invoice_q.all()
    invoice_total = sum(_to_float(i.total_amount) for i in invoice_rows)

    hire_q = db.query(HireMemoModel)
    hire_q = _apply_fy_filter(hire_q, HireMemoModel, fy)
    hire_rows = hire_q.all()
    hire_total = sum(_to_float(h.total_amount) for h in hire_rows)

    return [
        {
            "financial_year": fy or "ALL",
            "invoice_total": _money(invoice_total),
            "hirememo_total": _money(hire_total),
            "variance": _money(invoice_total - hire_total),
        }
    ]


def get_advance_aging_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    today = date.today()
    rows = db.query(HireMemoModel)
    rows = _apply_fy_filter(rows, HireMemoModel, fy).all()
    output = []
    for hm in rows:
        advance_total = _to_float(hm.advance_cash) + _to_float(hm.advance_bank)
        if advance_total <= 0:
            continue
        due_balance = _to_float(hm.balance)
        if due_balance <= 0:
            continue
        ageing_days = _days_between(hm.advance_payment_date or hm.hire_memo_date, today)
        output.append(
            {
                "hirememo_id": hm.id,
                "hire_memo_no": hm.hire_memo_no,
                "driver_name": hm.driver_name,
                "advance_total": _money(advance_total),
                "balance_due": _money(due_balance),
                "ageing_days": ageing_days,
                "bucket": _age_bucket(ageing_days),
            }
        )
    return sorted(output, key=lambda r: r["ageing_days"], reverse=True)


def get_cash_advance_utilization_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = db.query(HireMemoModel)
    rows = _apply_fy_filter(rows, HireMemoModel, fy).all()
    total_cash = sum(_to_float(r.advance_cash) for r in rows)
    total_settled = sum(max(_to_float(r.total_amount) - _to_float(r.balance), 0.0) for r in rows)
    utilization_pct = (total_settled / total_cash * 100.0) if total_cash > 0 else 0.0
    return [
        {
            "financial_year": fy or "ALL",
            "cash_advance_total": _money(total_cash),
            "settled_amount": _money(total_settled),
            "utilization_percent": round(utilization_pct, 2),
        }
    ]


def get_hirememo_print_trace_rows(db: Session, fy: Optional[str] = None, q: Optional[str] = None) -> list[dict]:
    hm_q = db.query(HireMemoModel)
    hm_q = _apply_fy_filter(hm_q, HireMemoModel, fy)
    if q and q.strip():
        pattern = f"%{q.strip()}%"
        hm_q = hm_q.filter(
            or_(
                HireMemoModel.hire_memo_no.ilike(pattern),
                HireMemoModel.driver_name.ilike(pattern),
                HireMemoModel.vehicle_number.ilike(pattern),
            )
        )
    hirememos = hm_q.all()

    hm_ids = [int(hm.id) for hm in hirememos if hm.id is not None]
    print_logs: dict[int, list] = {}
    if hm_ids:
        logs = (
            db.query(AuditLogModel)
            .filter(
                AuditLogModel.entity_type.in_(["HireMemo", "HIREMEMO", "hirememo"]),
                AuditLogModel.action == "PRINT",
                AuditLogModel.entity_id.in_(hm_ids),
            )
            .order_by(AuditLogModel.created_at.desc(), AuditLogModel.id.desc())
            .all()
        )
        for log in logs:
            hm_id = int(log.entity_id or 0)
            if hm_id <= 0:
                continue
            print_logs.setdefault(hm_id, []).append(log)

    output: list[dict] = []
    for hm in hirememos:
        hm_id = int(hm.id or 0)
        logs = print_logs.get(hm_id, [])
        last_log = logs[0] if logs else None
        output.append(
            {
                "hirememo_id": hm.id,
                "hire_memo_no": hm.hire_memo_no,
                "hire_memo_date": hm.hire_memo_date,
                "driver_name": hm.driver_name,
                "vehicle_number": hm.vehicle_number,
                "print_status": "PRINTED" if logs else "NOT_PRINTED",
                "print_count": len(logs),
                "printed_by": (last_log.user_name if last_log else None) or "system",
                "last_printed_at": last_log.created_at if last_log else None,
            }
        )

    return sorted(output, key=lambda r: (r.get("last_printed_at") is not None, r.get("last_printed_at")), reverse=True)


def get_trip_profitability_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    line_q = (
        db.query(InvoiceLineModel, InvoiceModel, LRModel)
        .join(InvoiceModel, InvoiceModel.id == InvoiceLineModel.invoice_id)
        .outerjoin(LRModel, LRModel.id == InvoiceLineModel.lr_id)
    )
    line_q = _apply_fy_filter(line_q, InvoiceModel, fy)
    rows = line_q.all()

    hm_by_lr: dict[int, float] = {}
    hm_q = db.query(HireMemoModel)
    hm_q = _apply_fy_filter(hm_q, HireMemoModel, fy)
    for hm in hm_q.all():
        if hm.lr_id:
            hm_by_lr[int(hm.lr_id)] = _to_float(hm.total_amount)

    output = []
    for line, invoice, lr in rows:
        revenue = _to_float(line.total or line.freight)
        cost = hm_by_lr.get(int(line.lr_id or 0), 0.0)
        profit = revenue - cost
        output.append(
            {
                "invoice_no": invoice.invoice_no,
                "invoice_date": invoice.invoice_date,
                "lr_number": line.lr_no or (lr.lr_number if lr else None),
                "vehicle_number": line.vehicle_no or (lr.vehicle_number if lr else None),
                "revenue": _money(revenue),
                "cost": _money(cost),
                "profit": _money(profit),
                "profit_margin_percent": round((profit / revenue * 100.0), 2) if revenue > 0 else 0.0,
            }
        )
    return sorted(output, key=lambda r: r["profit"], reverse=True)


def get_vehicle_cost_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = db.query(HireMemoModel)
    rows = _apply_fy_filter(rows, HireMemoModel, fy).all()
    grouped: dict[str, dict] = {}
    for hm in rows:
        key = (hm.vehicle_number or "Unknown Vehicle").strip() or "Unknown Vehicle"
        item = grouped.setdefault(key, {"vehicle_number": key, "trip_count": 0, "total_cost": 0.0, "avg_cost": 0.0})
        item["trip_count"] += 1
        item["total_cost"] += _to_float(hm.total_amount)
    for item in grouped.values():
        item["avg_cost"] = _money(item["total_cost"] / item["trip_count"] if item["trip_count"] else 0)
        item["total_cost"] = _money(item["total_cost"])
    return sorted(grouped.values(), key=lambda r: r["total_cost"], reverse=True)


def get_driver_performance_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    settlement = get_driver_settlement_rows(db, fy=fy)
    output = []
    for row in settlement:
        revenue = _to_float(row.get("total_freight"))
        due = _to_float(row.get("balance_due"))
        output.append(
            {
                "driver_name": row.get("driver_name"),
                "trip_count": int(row.get("trip_count") or 0),
                "revenue": _money(revenue),
                "outstanding": _money(due),
                "collection_efficiency_percent": round(((revenue - due) / revenue) * 100.0, 2) if revenue > 0 else 0.0,
            }
        )
    return sorted(output, key=lambda r: r["revenue"], reverse=True)


def get_pod_status_worklist_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = db.query(LRModel)
    rows = _apply_fy_filter(rows, LRModel, fy).order_by(LRModel.date.desc(), LRModel.id.desc()).all()
    return [
        {
            "lr_id": lr.id,
            "lr_number": lr.lr_number,
            "date": lr.date,
            "vehicle_number": lr.vehicle_number,
            "consignor_name": lr.consignor_name,
            "consignee_name": lr.consignee_name,
            "pod_received": bool(lr.pod_received),
            "pod_verified_at": lr.pod_verified_at,
        }
        for lr in rows
    ]


def get_receivables_aging_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    today = date.today()
    rows = (
        db.query(
            InvoiceModel,
            ClientModel,
            func.coalesce(func.sum(PaymentReceiptModel.net_amount), 0).label("amount_received"),
        )
        .outerjoin(ClientModel, ClientModel.id == InvoiceModel.client_id)
        .outerjoin(PaymentReceiptModel, PaymentReceiptModel.invoice_id == InvoiceModel.id)
        .group_by(InvoiceModel.id, ClientModel.id)
    )
    if fy:
        rows = rows.filter(InvoiceModel.financial_year == fy)
    rows = rows.all()

    output = []
    for invoice, client, amount_received in rows:
        outstanding = max(_to_float(invoice.net_amount or invoice.total_amount) - _to_float(amount_received), 0.0)
        if outstanding <= 0.009:
            continue
        age_days = _days_between(invoice.invoice_date, today)
        output.append(
            {
                "invoice_id": invoice.id,
                "invoice_no": invoice.invoice_no,
                "invoice_date": invoice.invoice_date,
                "client_name": client.name if client else f"Client {invoice.client_id}",
                "outstanding": _money(outstanding),
                "age_days": age_days,
                "bucket": _age_bucket(age_days),
            }
        )
    return sorted(output, key=lambda r: r["age_days"], reverse=True)


def _age_bucket(age_days: int) -> str:
    if age_days <= 30:
        return "0-30"
    if age_days <= 60:
        return "31-60"
    if age_days <= 90:
        return "61-90"
    return "90+"


def get_audit_log_rows(
    db: Session,
    entity: Optional[str] = None,
    user: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 200,
) -> list[dict]:
    rows = db.query(AuditLogModel)
    if entity:
        rows = rows.filter(AuditLogModel.entity_type.ilike(f"%{entity.strip()}%"))
    if user:
        rows = rows.filter(or_(AuditLogModel.user_name.ilike(f"%{user.strip()}%"), AuditLogModel.user_id == user))
    if q and q.strip():
        pattern = f"%{q.strip()}%"
        rows = rows.filter(
            or_(
                AuditLogModel.entity_type.ilike(pattern),
                AuditLogModel.action.ilike(pattern),
                AuditLogModel.user_name.ilike(pattern),
                cast(AuditLogModel.entity_id, String).ilike(pattern),
            )
        )
    rows = rows.order_by(AuditLogModel.created_at.desc()).limit(limit).all()
    return [
        {
            "id": int(row.id),
            "entity_type": row.entity_type,
            "entity_id": row.entity_id,
            "action": row.action,
            "user_id": row.user_id,
            "user_name": row.user_name,
            "created_at": row.created_at,
        }
        for row in rows
    ]


def get_contract_expiry_rows(db: Session, days: int = 30) -> list[dict]:
    cutoff = date.today() + timedelta(days=days)
    rows = (
        db.query(ContractModel)
        .filter(and_(ContractModel.end_date.isnot(None), ContractModel.end_date <= cutoff))
        .order_by(ContractModel.end_date.asc(), ContractModel.id.asc())
        .all()
    )
    today = date.today()
    return [
        {
            "contract_id": row.id,
            "name": row.name,
            "client_id": row.client_id,
            "end_date": row.end_date,
            "days_remaining": (row.end_date - today).days if row.end_date else None,
        }
        for row in rows
    ]


def get_debit_voucher_register_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = db.query(VoucherModel)
    rows = _apply_fy_filter(rows, VoucherModel, fy)
    rows = rows.filter(VoucherModel.voucher_type.ilike("%debit%")).order_by(VoucherModel.date.desc(), VoucherModel.id.desc()).all()
    return [_voucher_to_row(v) for v in rows]


def get_bank_book_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = db.query(VoucherModel)
    rows = _apply_fy_filter(rows, VoucherModel, fy)
    rows = rows.filter(VoucherModel.voucher_type.ilike("%bank%")).order_by(VoucherModel.date.desc(), VoucherModel.id.desc()).all()
    return [_voucher_to_row(v) for v in rows]


def get_cash_book_rows(db: Session, fy: Optional[str] = None) -> list[dict]:
    rows = db.query(VoucherModel)
    rows = _apply_fy_filter(rows, VoucherModel, fy)
    rows = rows.filter(VoucherModel.voucher_type.ilike("%cash%")).order_by(VoucherModel.date.desc(), VoucherModel.id.desc()).all()
    return [_voucher_to_row(v) for v in rows]


def _voucher_to_row(voucher: VoucherModel) -> dict:
    return {
        "voucher_id": voucher.id,
        "date": voucher.date,
        "voucher_type": voucher.voucher_type,
        "reference_type": voucher.reference_type,
        "reference_id": voucher.reference_id,
        "narration": voucher.narration,
        "amount": _money(voucher.amount),
        "financial_year": voucher.financial_year,
    }
