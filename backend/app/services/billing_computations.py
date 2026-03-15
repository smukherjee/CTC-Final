"""Pure financial computation functions for billing.

These functions contain zero database access — they take plain Python values
and return plain Python values.  This makes them trivially unit-testable
without any SQLAlchemy session or database fixture.

The service layer (billing_service.py) is responsible for fetching the raw
data needed and then delegating computation to these functions.
"""


def compute_net_amount(total_amount: float, tds_amount: float) -> float:
    """Return total_amount minus TDS deduction, floored at 0."""
    return max(float(total_amount) - float(tds_amount), 0.0)


def compute_outstanding(invoice_net: float, amount_received: float) -> float:
    """Return the unpaid balance for an invoice, floored at 0."""
    return max(float(invoice_net) - float(amount_received), 0.0)


def derive_payment_status(current_status: str, invoice_net: float, amount_received: float) -> str:
    """Derive the correct invoice status from payment totals.

    Rules
    -----
    - amount_received == 0          → "issued" (unless already in a terminal state)
    - amount_received >= invoice_net → "paid"
    - 0 < amount_received < net     → "partially_paid"
    """
    if amount_received <= 0:
        if current_status in {None, "", "partially_paid", "paid"}:
            return "issued"
        return current_status
    if compute_outstanding(invoice_net, amount_received) <= 0.009:
        return "paid"
    return "partially_paid"
