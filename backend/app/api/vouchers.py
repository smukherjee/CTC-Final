from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.voucher import VoucherResponse
from ..services.voucher_service import list_vouchers
from ..services.ledger_service import get_ledger_rows
from .security import require_finance_role

router = APIRouter(prefix="/vouchers", tags=["vouchers"], dependencies=[Depends(require_finance_role)])


@router.get("/", response_model=List[VoucherResponse])
def get_vouchers(
    book: Optional[str] = Query(default=None),
    voucher_type: Optional[str] = Query(default=None),
    fy: Optional[str] = Query(default=None),
    include_running_balance: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    selected_book = voucher_type or book
    if include_running_balance:
        return get_ledger_rows(db=db, book=selected_book, fy=fy)
    return list_vouchers(db, book=selected_book, fy=fy)
