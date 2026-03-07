from datetime import date, timedelta
from typing import Dict, List

from fastapi import APIRouter, Query

from ..db import SessionLocal
from ..models.invoice import InvoiceLineModel, InvoiceModel
from ..models.lr import LRModel
from ..models.client import ClientModel

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/pending-billing")
def pending_billing(fy: str | None = Query(default=None)) -> List[dict]:
    session = SessionLocal()
    try:
        cutoff = date.today() - timedelta(days=15)
        rows = (
            session.query(LRModel)
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
    finally:
        session.close()


@router.get("/outstanding-receivables")
def outstanding_receivables(fy: str | None = Query(default=None)) -> List[dict]:
    session = SessionLocal()
    try:
        rows = (
            session.query(InvoiceModel, ClientModel)
            .outerjoin(ClientModel, ClientModel.id == InvoiceModel.client_id)
            .filter(InvoiceModel.status != "paid")
        )
        if fy:
            rows = rows.filter(InvoiceModel.financial_year == fy)
        rows = rows.all()

        grouped: Dict[int, dict] = {}
        for invoice, client in rows:
            key = int(invoice.client_id or 0)
            if key not in grouped:
                grouped[key] = {
                    "client_id": key,
                    "client_name": client.name if client else f"Client {key}",
                    "invoice_count": 0,
                    "outstanding_total": 0.0,
                }
            grouped[key]["invoice_count"] += 1
            grouped[key]["outstanding_total"] += float(invoice.net_amount or invoice.total_amount or 0)

        return sorted(grouped.values(), key=lambda item: item["outstanding_total"], reverse=True)
    finally:
        session.close()
