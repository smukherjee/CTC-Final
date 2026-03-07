from typing import List, Optional

from fastapi import APIRouter, Query

from ..schemas.voucher import VoucherResponse
from ..services.voucher_service import list_vouchers

router = APIRouter(prefix="/vouchers", tags=["vouchers"])


@router.get("/", response_model=List[VoucherResponse])
def get_vouchers(
    book: Optional[str] = Query(default=None),
    voucher_type: Optional[str] = Query(default=None),
    fy: Optional[str] = Query(default=None),
):
    selected_book = voucher_type or book
    return list_vouchers(book=selected_book, fy=fy)
