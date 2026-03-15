from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.voucher import VoucherResponse
from ..services.voucher_service import list_vouchers

router = APIRouter(prefix="/vouchers", tags=["vouchers"])


@router.get("/", response_model=List[VoucherResponse])
def get_vouchers(
    book: Optional[str] = Query(default=None),
    voucher_type: Optional[str] = Query(default=None),
    fy: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    selected_book = voucher_type or book
    return list_vouchers(db, book=selected_book, fy=fy)
