from __future__ import annotations

from typing import Optional

from .voucher_service import list_vouchers


def get_ledger_rows(*, db, book: Optional[str] = None, fy: Optional[str] = None) -> list[dict]:
    """Return voucher rows enriched with debit/credit and running balance."""
    vouchers = list_vouchers(db, book=book, fy=fy)
    running = 0.0
    rows: list[dict] = []
    for row in vouchers:
        is_debit = "debit" in str(row.get("voucher_type") or "").lower()
        amount = float(row.get("amount") or 0)
        debit = amount if is_debit else 0.0
        credit = 0.0 if is_debit else amount
        running += credit - debit
        enriched = {
            **row,
            "debit": debit,
            "credit": credit,
            "running_balance": running,
        }
        rows.append(enriched)
    return rows
