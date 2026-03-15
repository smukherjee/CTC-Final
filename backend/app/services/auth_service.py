from __future__ import annotations

import base64
import json
from datetime import datetime, timezone
from typing import Any


def create_auth_token(*, user_id: int, user_name: str, role: str) -> str:
    """Create a lightweight auth token payload including role claims.

    This is intentionally simple because the current project has no dedicated
    auth provider/JWT dependency yet.
    """
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "name": user_name,
        "role": role,
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    raw = json.dumps(payload, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii")


def decode_auth_token(token: str) -> dict[str, Any]:
    raw = base64.urlsafe_b64decode(token.encode("ascii"))
    payload = json.loads(raw.decode("utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("Invalid auth token payload")
    return payload
