from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
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
def list_payment_receipts(fy: Optional[str] = Query(default=None), db: Session = Depends(get_db)):
    return list_receipts(db, fy=fy)


@router.post("/", response_model=PaymentReceiptResponse)
def create_payment_receipt(payload: PaymentReceiptCreate, db: Session = Depends(get_db)):
    try:
        return create(db, payload.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{receipt_id}", response_model=PaymentReceiptResponse)
def update_payment_receipt(receipt_id: int, payload: PaymentReceiptUpdate, db: Session = Depends(get_db)):
    try:
        updated = update(db, receipt_id, payload.model_dump(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Payment receipt not found")
        return updated
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{receipt_id}")
def delete_payment_receipt(receipt_id: int, db: Session = Depends(get_db)):
    deleted = delete(db, receipt_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Payment receipt not found")
    return {"ok": True}
