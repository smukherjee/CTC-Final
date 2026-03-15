"""Audit logging helper for financial compliance.

Writes a row to audit_log whenever a financial entity (LR, Invoice,
PaymentReceipt, HireMemo) is created, updated, or deleted.

Usage::

    from .audit_service import log_action

    before = _to_dict(row)         # snapshot before change
    # ... make changes ...
    after = _to_dict(row)          # snapshot after change
    log_action(db, "Invoice", row.id, "UPDATE", before=before, after=after)
    db.commit()

The helper silently swallows exceptions so that an audit failure never
causes the primary transaction to fail.  Any log write error is printed
to stderr for ops visibility.
"""

import sys
from typing import Any, Optional

from sqlalchemy.orm import Session

from ..models.audit_log import AuditLogModel


def _safe_serial(obj: Any) -> Any:
    """Convert types not natively JSON-serialisable (date, Decimal…)."""
    if obj is None:
        return obj
    if isinstance(obj, dict):
        return {k: _safe_serial(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_safe_serial(v) for v in obj]
    # date / datetime → ISO string
    if hasattr(obj, "isoformat"):
        return obj.isoformat()
    # Decimal, float, int → float
    try:
        return float(obj)
    except (TypeError, ValueError):
        pass
    return str(obj)


def log_action(
    db: Session,
    entity_type: str,
    entity_id: Optional[int],
    action: str,
    *,
    before: Optional[dict] = None,
    after: Optional[dict] = None,
    user_id: Optional[int] = None,
    user_name: Optional[str] = None,
) -> None:
    """Append one row to audit_log.  Never raises — failures are logged to stderr."""
    try:
        entry = AuditLogModel(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action.upper(),
            user_id=user_id,
            user_name=user_name,
            before_data=_safe_serial(before),
            after_data=_safe_serial(after),
        )
        db.add(entry)
        # Intentionally NOT committing here — the caller commits its own
        # transaction which includes this row.
    except Exception as exc:  # noqa: BLE001
        print(f"[audit_service] Failed to write audit log: {exc}", file=sys.stderr)
