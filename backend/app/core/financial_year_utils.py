"""Financial year utilities for CTC-ERP.

FY format: 'YYYY-YY'  e.g. '2025-26'
"""
from datetime import date
from sqlalchemy.orm import Session


def get_current_fy() -> str:
    """Return the current financial year string based on today's date."""
    return fy_from_date(date.today())


def fy_from_date(d: date) -> str:
    """Return financial year string for a given date.

    FY starts April 1. So Jan-Mar dates belong to the previous calendar year's FY.
    e.g. 2026-01-15 → '2025-26', 2026-04-01 → '2026-27'
    """
    if d.month >= 4:
        start = d.year
    else:
        start = d.year - 1
    end = (start + 1) % 100  # last two digits
    return f"{start}-{end:02d}"


def next_invoice_seq(session: Session, fy: str) -> int:
    """Return the next invoice sequence number for the given FY.

    Uses COUNT of existing invoices in that FY + 1.
    Relies on the DB UNIQUE(invoice_no, financial_year) constraint to prevent races.
    """
    from ..models.invoice import InvoiceModel
    count = session.query(InvoiceModel).filter(
        InvoiceModel.financial_year == fy
    ).count()
    return count + 1


def next_hirememo_seq(session: Session, fy: str) -> int:
    """Return the next hire memo sequence number for the given FY."""
    from ..models.hirememo import HireMemoModel
    count = session.query(HireMemoModel).filter(
        HireMemoModel.financial_year == fy
    ).count()
    return count + 1


def format_invoice_no(seq: int, fy: str) -> str:
    """Format an invoice number, e.g. format_invoice_no(1543, '2025-26') → '1543/25-26'."""
    fy_suffix = fy[2:]  # '2025-26' → '25-26'
    return f"{seq}/{fy_suffix}"
