from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.lr import LRModel
from ..models.file_upload import FileUploadModel
from .security import require_finance_role
from ..services.reports_service import (
    get_advance_aging_rows,
    get_advance_payment_register_rows,
    get_audit_log_rows,
    get_bank_book_rows,
    get_cash_advance_utilization_rows,
    get_cash_book_rows,
    get_contract_expiry_rows,
    get_debit_voucher_register_rows,
    get_driver_outstanding_rows,
    get_driver_performance_rows,
    get_driver_settlement_rows,
    get_eway_expiry_alerts,
    get_hirememo_print_trace_rows,
    get_hirememo_register_rows,
    get_pending_billing_rows,
    get_pod_status_worklist_rows,
    get_outstanding_receivables_rows,
    get_receivables_aging_rows,
    get_settlement_variance_rows,
    get_trip_profitability_rows,
    get_vehicle_cost_rows,
    get_vendor_spend_rows,
    parse_report_filters,
)

router = APIRouter(prefix="/reports", tags=["reports"], dependencies=[Depends(require_finance_role)])


def _apply_query_sorting(query, *, sort_by: str | None, sort_dir: str, sort_map: dict, default_sort):
    sort_column = sort_map.get((sort_by or "").strip(), default_sort)
    sort_direction = (sort_dir or "desc").strip().lower()
    order_expr = asc(sort_column) if sort_direction == "asc" else desc(sort_column)
    return query.order_by(order_expr)


def _apply_query_pagination(query, *, page: int, page_size: int):
    current_page = max(int(page), 1)
    size = max(min(int(page_size), 500), 1)
    return query.offset((current_page - 1) * size).limit(size)


@router.get("/eway-expiring")
def eway_expiring(
    hours: int = Query(default=8, ge=1, le=168),
    months: int | None = Query(default=None, ge=1, le=12),
    db: Session = Depends(get_db),
) -> List[dict]:
    return get_eway_expiry_alerts(db, hours=hours, months=months)


@router.get("/pod-search")
def pod_search(
    q: str | None = Query(default=None),
    lr_number: str | None = Query(default=None),
    vehicle_number: str | None = Query(default=None),
    fy: str | None = Query(default=None),
    date_from: str | None = Query(default=None, description="YYYY-MM-DD"),
    date_to: str | None = Query(default=None, description="YYYY-MM-DD"),
    role: str | None = Query(default=None),
    entity: str | None = Query(default=None),
    sort_by: str | None = Query(default="uploaded_at"),
    sort_dir: str = Query(default="desc", pattern="^(?i)(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=500),
    include_archived: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> List[dict]:
    parsed_filters = parse_report_filters(
        fy=fy,
        date_from=date_from,
        date_to=date_to,
        entity=entity,
        role=role,
    )

    rows = (
        db.query(FileUploadModel, LRModel)
        .join(LRModel, FileUploadModel.lr_id == LRModel.id)
        .filter(FileUploadModel.document_type == "POD")
    )
    if not include_archived:
        rows = rows.filter(FileUploadModel.is_archived.is_(False))
    if parsed_filters["fy"]:
        rows = rows.filter(LRModel.financial_year == parsed_filters["fy"])
    if parsed_filters["date_from"]:
        rows = rows.filter(LRModel.date >= parsed_filters["date_from"])
    if parsed_filters["date_to"]:
        rows = rows.filter(LRModel.date <= parsed_filters["date_to"])
    if lr_number:
        rows = rows.filter(LRModel.lr_number.ilike(f"%{lr_number.strip()}%"))
    if vehicle_number:
        rows = rows.filter(LRModel.vehicle_number.ilike(f"%{vehicle_number.strip()}%"))
    if q:
        pattern = f"%{q.strip()}%"
        rows = rows.filter(
            or_(
                LRModel.lr_number.ilike(pattern),
                LRModel.vehicle_number.ilike(pattern),
                LRModel.consignor_name.ilike(pattern),
                LRModel.consignee_name.ilike(pattern),
                FileUploadModel.original_filename.ilike(pattern),
            )
        )

    sort_map = {
        "uploaded_at": FileUploadModel.created_at,
        "lr_number": LRModel.lr_number,
        "vehicle_number": LRModel.vehicle_number,
        "date": LRModel.date,
    }
    rows = _apply_query_sorting(
        rows,
        sort_by=sort_by,
        sort_dir=sort_dir,
        sort_map=sort_map,
        default_sort=FileUploadModel.created_at,
    )
    rows = _apply_query_pagination(rows, page=page, page_size=page_size).all()
    return [
        {
            "file_id": doc.id,
            "lr_id": lr.id,
            "lr_number": lr.lr_number,
            "vehicle_number": lr.vehicle_number,
            "consignor_name": lr.consignor_name,
            "consignee_name": lr.consignee_name,
            "pod_received": lr.pod_received,
            "pod_verified_at": lr.pod_verified_at,
            "file_url": doc.file_url,
            "original_filename": doc.original_filename,
            "uploaded_at": doc.created_at,
            "is_archived": bool(doc.is_archived),
        }
        for doc, lr in rows
    ]


@router.get("/pending-billing")
def pending_billing(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_pending_billing_rows(db, fy=fy)


@router.get("/outstanding-receivables")
def outstanding_receivables(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_outstanding_receivables_rows(db, fy=fy)


@router.get("/hirememo-register")
def hirememo_register(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_hirememo_register_rows(db, fy=fy)


@router.get("/advance-payment-register")
def advance_payment_register(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_advance_payment_register_rows(db, fy=fy)


@router.get("/driver-settlement")
def driver_settlement(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_driver_settlement_rows(db, fy=fy)


@router.get("/driver-outstanding")
def driver_outstanding(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_driver_outstanding_rows(db, fy=fy)


@router.get("/vendor-spend")
def vendor_spend(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_vendor_spend_rows(db, fy=fy)


@router.get("/settlement-variance")
def settlement_variance(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_settlement_variance_rows(db, fy=fy)


@router.get("/advance-aging")
def advance_aging(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_advance_aging_rows(db, fy=fy)


@router.get("/cash-advance-utilization")
def cash_advance_utilization(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_cash_advance_utilization_rows(db, fy=fy)


@router.get("/hirememo-print-trace")
def hirememo_print_trace(
    fy: str | None = Query(default=None),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> List[dict]:
    return get_hirememo_print_trace_rows(db, fy=fy, q=q)


@router.get("/trip-profitability")
def trip_profitability(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_trip_profitability_rows(db, fy=fy)


@router.get("/per-vehicle-cost")
def per_vehicle_cost(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_vehicle_cost_rows(db, fy=fy)


@router.get("/per-driver-performance")
def per_driver_performance(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_driver_performance_rows(db, fy=fy)


@router.get("/pod-status-worklist")
def pod_status_worklist(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_pod_status_worklist_rows(db, fy=fy)


@router.get("/receivables-aging")
def receivables_aging(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_receivables_aging_rows(db, fy=fy)


@router.get("/audit-log")
def audit_log(
    entity: str | None = Query(default=None),
    user: str | None = Query(default=None),
    q: str | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=1000),
    db: Session = Depends(get_db),
) -> List[dict]:
    return get_audit_log_rows(db, entity=entity, user=user, q=q, limit=limit)


@router.get("/contract-expiry")
def contract_expiry(days: int = Query(default=30, ge=1, le=365), db: Session = Depends(get_db)) -> List[dict]:
    return get_contract_expiry_rows(db, days=days)


@router.get("/debit-voucher-register")
def debit_voucher_register(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_debit_voucher_register_rows(db, fy=fy)


@router.get("/bank-book")
def bank_book(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_bank_book_rows(db, fy=fy)


@router.get("/cash-book")
def cash_book(fy: str | None = Query(default=None), db: Session = Depends(get_db)) -> List[dict]:
    return get_cash_book_rows(db, fy=fy)
