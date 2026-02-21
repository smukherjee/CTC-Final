from typing import List
from datetime import date as dt_date, datetime as dt_datetime, timezone
from ..schemas.lr import LRCreate, LRResponse
from ..models.lr import LRModel
from ..models.ewaybill import EWayBillModel
from ..db import SessionLocal


def _model_to_dict(m: LRModel) -> dict:
    return {
        'id': m.id,
        'lr_number': m.lr_number,
        'date': m.date.isoformat() if m.date else None,
        'consignor_id': m.consignor_id,
        'consignor_name': m.consignor_name,
        'consignee_id': m.consignee_id,
        'consignee_name': m.consignee_name,
        'origin': m.origin,
        'destination': m.destination,
        'delivery_at': m.delivery_at,
        'through': m.through,
        'through_id': m.through_id,
        'fob': m.fob,
        'goods_items': m.goods_items,
        'articles_count': m.articles_count,
        'articles_description': m.articles_description,
        'weight': float(m.weight) if m.weight is not None else None,
        'freight_amount': float(m.freight_amount) if m.freight_amount is not None else None,
        'status': m.status,
        # Vehicle
        'vehicle_id': m.vehicle_id,
        'vehicle_number': m.vehicle_number,
        'vehicle_type': m.vehicle_type,
        'seal_number': m.seal_number,
        'driver_name': m.driver_name,
        'driver_mobile': m.driver_mobile,
        # Risk & Logistics
        'booked_on_owners_risk': m.booked_on_owners_risk,
        'loading_point_times': m.loading_point_times,
        # Financials
        'value_rs': float(m.value_rs) if m.value_rs is not None else None,
        'surcharge': float(m.surcharge) if m.surcharge is not None else None,
        'hamali_charges': float(m.hamali_charges) if m.hamali_charges is not None else None,
        'st_charges': float(m.st_charges) if m.st_charges is not None else None,
        'total': float(m.total) if m.total is not None else None,
        # Dispatch Register
        'bill_number': m.bill_number,
        'bill_date': m.bill_date.isoformat() if m.bill_date else None,
        'amount_passed': float(m.amount_passed) if m.amount_passed is not None else None,
        'deductions': m.deductions,
        'cm_no': m.cm_no,
        'cm_date': m.cm_date.isoformat() if m.cm_date else None,
        'remarks': m.remarks,
        'eway_bill': m.eway_bill,
        'eway_bills': [],
        'pod_url': m.pod_url,
        'pod_verified_at': m.pod_verified_at.isoformat() if m.pod_verified_at else None,
    }


def _map_eway_model(e: EWayBillModel) -> dict:
    return {
        'id': e.id,
        'lr_id': e.lr_id,
        'number': e.number,
        'valid_from': e.valid_from.isoformat() if e.valid_from else None,
        'valid_upto': e.valid_upto.isoformat() if e.valid_upto else None,
        'expires_at': e.expires_at.isoformat() if e.expires_at else None,
        'status': e.status,
        'alert_sent': bool(e.alert_sent),
        'file_url': e.file_url,
        'extension_count': int(e.extension_count or 0),
        'last_extended_at': e.last_extended_at.isoformat() if e.last_extended_at else None,
        'meta': e.meta,
    }


def _attach_eway_bills(db, lr_payloads: List[dict]) -> List[dict]:
    if not lr_payloads:
        return lr_payloads

    lr_ids = [int(row['id']) for row in lr_payloads if row.get('id') is not None]
    if not lr_ids:
        return lr_payloads

    try:
        rows = (
            db.query(EWayBillModel)
            .filter(EWayBillModel.lr_id.in_(lr_ids))
            .order_by(EWayBillModel.valid_upto.desc().nullslast(), EWayBillModel.id.desc())
            .all()
        )
    except Exception:
        # If eway_bills table is not migrated yet, keep LR API functional.
        for lr_data in lr_payloads:
            if 'eway_bills' not in lr_data:
                lr_data['eway_bills'] = []
        return lr_payloads

    grouped: dict[int, list[dict]] = {}
    for item in rows:
        grouped.setdefault(int(item.lr_id), []).append(_map_eway_model(item))

    for lr_data in lr_payloads:
        lr_id = int(lr_data['id'])
        eway_list = grouped.get(lr_id, [])
        lr_data['eway_bills'] = eway_list
        # Keep backward compatibility for old UI fields.
        if eway_list:
            lr_data['eway_bill'] = eway_list[0]
        elif not lr_data.get('eway_bill'):
            lr_data['eway_bill'] = None
    return lr_payloads


def _coerce_lr_payload(payload: dict) -> dict:
    """Normalize payload values so DB columns receive stable types."""
    normalized = dict(payload)

    # Date columns expect python date values (or None).
    for date_key in ('date', 'bill_date', 'cm_date'):
        raw_date = normalized.get(date_key)
        if isinstance(raw_date, str):
            raw_date = raw_date.strip()
            if not raw_date:
                normalized[date_key] = None
            else:
                try:
                    normalized[date_key] = dt_date.fromisoformat(raw_date)
                except ValueError:
                    # Keep original value; API validation will surface errors if any.
                    pass

    raw_pod_verified_at = normalized.get('pod_verified_at')
    if isinstance(raw_pod_verified_at, str):
        raw = raw_pod_verified_at.strip()
        if not raw:
            normalized['pod_verified_at'] = None
        else:
            try:
                normalized['pod_verified_at'] = dt_datetime.fromisoformat(raw.replace('Z', '+00:00'))
            except ValueError:
                pass

    # Ensure loading point times is dict/null.
    lpt = normalized.get('loading_point_times')
    if lpt is not None and not isinstance(lpt, dict):
        normalized['loading_point_times'] = None

    return normalized


def create_lr(payload: LRCreate) -> dict:
    db = SessionLocal()
    try:
        payload_dict = _coerce_lr_payload(payload.dict())
        obj = LRModel(
            lr_number=payload_dict.get('lr_number'),
            date=payload_dict.get('date'),
            consignor_id=payload_dict.get('consignor_id'),
            consignor_name=payload_dict.get('consignor_name'),
            consignee_id=payload_dict.get('consignee_id'),
            consignee_name=payload_dict.get('consignee_name'),
            origin=payload_dict.get('origin'),
            destination=payload_dict.get('destination'),
            delivery_at=payload_dict.get('delivery_at'),
            through=payload_dict.get('through'),
            through_id=payload_dict.get('through_id'),
            fob=payload_dict.get('fob'),
            goods_items=payload_dict.get('goods_items'),
            articles_count=payload_dict.get('articles_count'),
            articles_description=payload_dict.get('articles_description'),
            weight=payload_dict.get('weight'),
            freight_amount=payload_dict.get('freight_amount'),
            status=payload_dict.get('status') or 'DRAFT',
            # Vehicle
            vehicle_id=payload_dict.get('vehicle_id'),
            vehicle_number=payload_dict.get('vehicle_number'),
            vehicle_type=payload_dict.get('vehicle_type'),
            seal_number=payload_dict.get('seal_number'),
            driver_name=payload_dict.get('driver_name'),
            driver_mobile=payload_dict.get('driver_mobile'),
            # Risk & Logistics
            booked_on_owners_risk=payload_dict.get('booked_on_owners_risk'),
            loading_point_times=payload_dict.get('loading_point_times'),
            # Financials
            value_rs=payload_dict.get('value_rs'),
            surcharge=payload_dict.get('surcharge'),
            hamali_charges=payload_dict.get('hamali_charges'),
            st_charges=payload_dict.get('st_charges'),
            total=payload_dict.get('total'),
            # Dispatch Register
            bill_number=payload_dict.get('bill_number'),
            bill_date=payload_dict.get('bill_date'),
            amount_passed=payload_dict.get('amount_passed'),
            deductions=payload_dict.get('deductions'),
            cm_no=payload_dict.get('cm_no'),
            cm_date=payload_dict.get('cm_date'),
            remarks=payload_dict.get('remarks'),
            eway_bill=payload_dict.get('eway_bill'),
            pod_url=payload_dict.get('pod_url'),
            pod_verified_at=payload_dict.get('pod_verified_at'),
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        data = _model_to_dict(obj)
        return _attach_eway_bills(db, [data])[0]
    finally:
        db.close()


def get_all_lrs() -> List[dict]:
    db = SessionLocal()
    try:
        rows = db.query(LRModel).order_by(LRModel.id.desc()).all()
        payloads = [_model_to_dict(r) for r in rows]
        return _attach_eway_bills(db, payloads)
    finally:
        db.close()


def get_lr_by_id(lr_id: int) -> dict:
    db = SessionLocal()
    try:
        obj = db.query(LRModel).filter(LRModel.id == lr_id).first()
        if not obj:
            return None
        data = _model_to_dict(obj)
        return _attach_eway_bills(db, [data])[0]
    finally:
        db.close()


def get_lr_by_number(lr_number: str) -> dict:
    db = SessionLocal()
    try:
        obj = db.query(LRModel).filter(LRModel.lr_number == lr_number).first()
        if not obj:
            return None
        data = _model_to_dict(obj)
        return _attach_eway_bills(db, [data])[0]
    finally:
        db.close()


def update_lr(lr_id: int, payload: dict) -> dict:
    db = SessionLocal()
    try:
        obj = db.query(LRModel).filter(LRModel.id == lr_id).first()
        if not obj:
            return None

        normalized = _coerce_lr_payload(payload)

        for key, value in normalized.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        
        db.commit()
        db.refresh(obj)
        data = _model_to_dict(obj)
        return _attach_eway_bills(db, [data])[0]
    finally:
        db.close()


def delete_lr(lr_id: int) -> bool:
    db = SessionLocal()
    try:
        deleted = db.query(LRModel).filter(LRModel.id == lr_id).delete()
        db.commit()
        return bool(deleted)
    finally:
        db.close()


def verify_lr_pod(lr_id: int) -> dict:
    db = SessionLocal()
    try:
        obj = db.query(LRModel).filter(LRModel.id == lr_id).first()
        if not obj:
            return None
        if not obj.pod_url:
            raise ValueError("Cannot verify POD because no POD file is uploaded")
        obj.pod_verified_at = dt_datetime.now(timezone.utc)
        obj.status = 'POD_VERIFIED'
        db.commit()
        db.refresh(obj)
        data = _model_to_dict(obj)
        return _attach_eway_bills(db, [data])[0]
    finally:
        db.close()
