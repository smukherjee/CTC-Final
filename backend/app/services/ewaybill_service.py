from datetime import date as dt_date, datetime as dt_datetime, time, timedelta, timezone
from typing import List, Optional
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from ..models.ewaybill import EWayBillModel
from ..models.lr import LRModel

BUSINESS_TZ = ZoneInfo("Asia/Kolkata")


def _parse_date(value) -> Optional[dt_date]:
    if value is None:
        return None
    if isinstance(value, dt_date):
        return value
    if isinstance(value, str):
        raw = value.strip()
        if not raw:
            return None
        try:
            return dt_date.fromisoformat(raw)
        except ValueError as exc:
            raise ValueError(f"Invalid date value: {value}") from exc
    raise ValueError(f"Unsupported date value: {value}")


def _expiry_at_midnight(valid_upto: Optional[dt_date]) -> Optional[dt_datetime]:
    if not valid_upto:
        return None
    # E-way bill expires at midnight immediately after the validity date.
    local_midnight = dt_datetime.combine(valid_upto + timedelta(days=1), time.min, tzinfo=BUSINESS_TZ)
    return local_midnight.astimezone(timezone.utc)


def _derive_status(expires_at: Optional[dt_datetime]) -> str:
    if not expires_at:
        return "ACTIVE"
    return "EXPIRED" if dt_datetime.now(timezone.utc) >= expires_at else "ACTIVE"


def _model_to_dict(m: EWayBillModel) -> dict:
    status = _derive_status(m.expires_at)
    return {
        "id": m.id,
        "lr_id": m.lr_id,
        "number": m.number,
        "valid_from": m.valid_from.isoformat() if m.valid_from else None,
        "valid_upto": m.valid_upto.isoformat() if m.valid_upto else None,
        "expires_at": m.expires_at.isoformat() if m.expires_at else None,
        "status": status,
        "is_expired": status == "EXPIRED",
        "alert_sent": bool(m.alert_sent),
        "file_url": m.file_url,
        "extension_count": int(m.extension_count or 0),
        "last_extended_at": m.last_extended_at.isoformat() if m.last_extended_at else None,
        "meta": m.meta,
    }


def _validate_lr_exists(db: Session, lr_id: int) -> None:
    lr = db.query(LRModel).filter(LRModel.id == lr_id).first()
    if not lr:
        raise ValueError("LR not found")


def _sync_lr_inline_eway(db: Session, lr_id: int) -> None:
    """Keep LR inline E-way fields aligned with latest eway_bills row."""
    lr = db.query(LRModel).filter(LRModel.id == lr_id).first()
    if not lr:
        return
    latest = (
        db.query(EWayBillModel)
        .filter(EWayBillModel.lr_id == lr_id)
        .order_by(EWayBillModel.valid_upto.desc().nullslast(), EWayBillModel.id.desc())
        .first()
    )
    if latest:
        lr.eway_bill_no = latest.number
        lr.eway_bill_expiry = latest.expires_at
    else:
        lr.eway_bill_no = None
        lr.eway_bill_expiry = None
    db.add(lr)


def create_ewaybill(db: Session, payload: dict) -> dict:
    lr_id = payload.get("lr_id")
    if not lr_id:
        raise ValueError("lr_id is required")
    _validate_lr_exists(db, int(lr_id))

    number = (payload.get("number") or "").strip()
    if not number:
        raise ValueError("number is required")

    valid_from = _parse_date(payload.get("valid_from"))
    valid_upto = _parse_date(payload.get("valid_upto"))
    if valid_from and valid_upto and valid_upto < valid_from:
        raise ValueError("valid_upto cannot be before valid_from")

    obj = EWayBillModel(
        lr_id=int(lr_id),
        number=number,
        valid_from=valid_from,
        valid_upto=valid_upto,
        expires_at=_expiry_at_midnight(valid_upto),
        status="ACTIVE",
        alert_sent=bool(payload.get("alert_sent")),
        file_url=payload.get("file_url"),
        meta=payload.get("meta"),
        extension_count=0,
    )
    db.add(obj)
    _sync_lr_inline_eway(db, int(lr_id))
    db.commit()
    db.refresh(obj)
    return _model_to_dict(obj)


def get_ewaybills_for_lr(db: Session, lr_id: int) -> List[dict]:
    rows = (
        db.query(EWayBillModel)
        .filter(EWayBillModel.lr_id == lr_id)
        .order_by(EWayBillModel.valid_upto.desc().nullslast(), EWayBillModel.id.desc())
        .all()
    )
    return [_model_to_dict(r) for r in rows]


def get_ewaybill_by_id(db: Session, eway_id: int) -> Optional[dict]:
    obj = db.query(EWayBillModel).filter(EWayBillModel.id == eway_id).first()
    return _model_to_dict(obj) if obj else None


def update_ewaybill(db: Session, eway_id: int, payload: dict) -> Optional[dict]:
    obj = db.query(EWayBillModel).filter(EWayBillModel.id == eway_id).first()
    if not obj:
        return None

    if "lr_id" in payload and payload.get("lr_id") is not None:
        _validate_lr_exists(db, int(payload["lr_id"]))
        obj.lr_id = int(payload["lr_id"])

    if "number" in payload and payload.get("number") is not None:
        obj.number = str(payload["number"]).strip()

    next_valid_from = obj.valid_from
    next_valid_upto = obj.valid_upto
    if "valid_from" in payload:
        next_valid_from = _parse_date(payload.get("valid_from"))
    if "valid_upto" in payload:
        next_valid_upto = _parse_date(payload.get("valid_upto"))

    if next_valid_from and next_valid_upto and next_valid_upto < next_valid_from:
        raise ValueError("valid_upto cannot be before valid_from")

    obj.valid_from = next_valid_from
    obj.valid_upto = next_valid_upto
    obj.expires_at = _expiry_at_midnight(next_valid_upto)

    if "alert_sent" in payload and payload.get("alert_sent") is not None:
        obj.alert_sent = bool(payload.get("alert_sent"))
    if "file_url" in payload:
        obj.file_url = payload.get("file_url")
    if "meta" in payload:
        obj.meta = payload.get("meta")

    obj.status = _derive_status(obj.expires_at)
    _sync_lr_inline_eway(db, int(obj.lr_id))
    db.commit()
    db.refresh(obj)
    return _model_to_dict(obj)


def extend_ewaybill(db: Session, eway_id: int, new_valid_upto) -> Optional[dict]:
    obj = db.query(EWayBillModel).filter(EWayBillModel.id == eway_id).first()
    if not obj:
        return None

    parsed_new_valid_upto = _parse_date(new_valid_upto)
    if not parsed_new_valid_upto:
        raise ValueError("valid_upto is required")
    if obj.valid_upto and parsed_new_valid_upto <= obj.valid_upto:
        raise ValueError("New validity date must be greater than current validity date")

    obj.valid_upto = parsed_new_valid_upto
    obj.expires_at = _expiry_at_midnight(parsed_new_valid_upto)
    obj.alert_sent = False
    obj.extension_count = int(obj.extension_count or 0) + 1
    obj.last_extended_at = dt_datetime.now(timezone.utc)
    obj.status = _derive_status(obj.expires_at)
    _sync_lr_inline_eway(db, int(obj.lr_id))
    db.commit()
    db.refresh(obj)
    return _model_to_dict(obj)


def delete_ewaybill(db: Session, eway_id: int) -> bool:
    obj = db.query(EWayBillModel).filter(EWayBillModel.id == eway_id).first()
    if not obj:
        return False
    lr_id = int(obj.lr_id)
    db.delete(obj)
    _sync_lr_inline_eway(db, lr_id)
    db.commit()
    return True
