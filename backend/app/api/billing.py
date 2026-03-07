from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from ..schemas.invoice import InvoiceCreate, InvoiceResponse, InvoiceUpdate
from ..services.billing_service import (
    create_invoice,
    delete_invoice,
    get_invoice,
    list_invoices,
    update_invoice,
)

router = APIRouter(prefix="/billing/invoices", tags=["billing"])


@router.get("/", response_model=List[InvoiceResponse])
def list_billing_invoices(
    fy: Optional[str] = Query(default=None),
    client_id: Optional[int] = Query(default=None),
):
    return list_invoices(fy=fy, client_id=client_id)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_billing_invoice(invoice_id: int):
    invoice = get_invoice(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.post("/", response_model=InvoiceResponse)
def create_billing_invoice(payload: InvoiceCreate):
    try:
        return create_invoice(payload.dict())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_billing_invoice(invoice_id: int, payload: InvoiceUpdate):
    try:
        updated = update_invoice(invoice_id, payload.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return updated
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{invoice_id}")
def remove_billing_invoice(invoice_id: int):
    deleted = delete_invoice(invoice_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"ok": True}
