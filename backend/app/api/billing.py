from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from .security import require_finance_role
from ..schemas.invoice import InvoiceCreate, InvoiceResponse, InvoiceUpdate
from ..services.billing_service import (
    create_invoice,
    delete_invoice,
    get_invoice,
    get_invoice_print_data,
    list_invoices,
    update_invoice,
)

router = APIRouter(prefix="/billing/invoices", tags=["billing"], dependencies=[Depends(require_finance_role)])


@router.get("/", response_model=List[InvoiceResponse])
def list_billing_invoices(
    fy: Optional[str] = Query(default=None),
    client_id: Optional[int] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    return list_invoices(db, fy=fy, client_id=client_id, skip=skip, limit=limit)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_billing_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.get("/{invoice_id}/print-data")
def get_billing_invoice_print_data(invoice_id: int, db: Session = Depends(get_db)):
    payload = get_invoice_print_data(db, invoice_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return payload


@router.post("/", response_model=InvoiceResponse)
def create_billing_invoice(payload: InvoiceCreate, db: Session = Depends(get_db)):
    try:
        return create_invoice(db, payload.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_billing_invoice(invoice_id: int, payload: InvoiceUpdate, db: Session = Depends(get_db)):
    try:
        updated = update_invoice(db, invoice_id, payload.model_dump(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return updated
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{invoice_id}")
def remove_billing_invoice(invoice_id: int, db: Session = Depends(get_db)):
    deleted = delete_invoice(db, invoice_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"ok": True}
