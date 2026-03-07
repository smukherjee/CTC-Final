from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from ..schemas.payment_receipt import (
    PaymentReceiptCreate,
    PaymentReceiptResponse,
    PaymentReceiptUpdate,
)
from ..services.payment_receipt_service import (
    create,
    delete,
    list_receipts,
    update,
)

router = APIRouter(prefix="/payment-receipts", tags=["payment-receipts"])


@router.get("/", response_model=List[PaymentReceiptResponse])
def list_payment_receipts(fy: Optional[str] = Query(default=None)):
    return list_receipts(fy=fy)


@router.post("/", response_model=PaymentReceiptResponse)
def create_payment_receipt(payload: PaymentReceiptCreate):
    try:
        return create(payload.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{receipt_id}", response_model=PaymentReceiptResponse)
def update_payment_receipt(receipt_id: int, payload: PaymentReceiptUpdate):
    try:
        updated = update(receipt_id, payload.model_dump(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Payment receipt not found")
        return updated
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{receipt_id}")
def delete_payment_receipt(receipt_id: int):
    deleted = delete(receipt_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Payment receipt not found")
    return {"ok": True}
