from __future__ import annotations

from fastapi import Header, HTTPException


FINANCE_ROLES = {"ADMIN", "ACCOUNTS"}


def require_finance_role(x_user_role: str | None = Header(default=None, alias="X-User-Role")) -> str:
    role = (x_user_role or "").strip().upper()
    if role not in FINANCE_ROLES:
        raise HTTPException(status_code=403, detail="Finance module access denied")
    return role
