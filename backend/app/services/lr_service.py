from typing import List
from ..schemas.lr import LRCreate, LRResponse
from ..models.lr import LRModel
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
        'remarks': m.remarks,
        'eway_bill': m.eway_bill,
    }


def create_lr(payload: LRCreate) -> dict:
    db = SessionLocal()
    try:
        obj = LRModel(
            lr_number=payload.lr_number,
            date=payload.date,
            consignor_id=payload.consignor_id,
            consignor_name=payload.consignor_name,
            consignee_id=payload.consignee_id,
            consignee_name=payload.consignee_name,
            origin=payload.origin,
            destination=payload.destination,
            delivery_at=payload.delivery_at,
            through=payload.through,
            through_id=payload.through_id,
            fob=payload.fob,
            goods_items=payload.goods_items,
            articles_count=payload.articles_count,
            articles_description=payload.articles_description,
            weight=payload.weight,
            freight_amount=payload.freight_amount,
            status=payload.status or 'DRAFT',
            # Vehicle
            vehicle_id=payload.vehicle_id,
            vehicle_number=payload.vehicle_number,
            vehicle_type=payload.vehicle_type,
            seal_number=payload.seal_number,
            driver_name=payload.driver_name,
            driver_mobile=payload.driver_mobile,
            # Risk & Logistics
            booked_on_owners_risk=payload.booked_on_owners_risk,
            loading_point_times=payload.loading_point_times,
            # Financials
            value_rs=payload.value_rs,
            surcharge=payload.surcharge,
            hamali_charges=payload.hamali_charges,
            st_charges=payload.st_charges,
            total=payload.total,
            # Dispatch Register
            bill_number=payload.bill_number,
            remarks=payload.remarks,
            eway_bill=payload.eway_bill,
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return _model_to_dict(obj)
    finally:
        db.close()


def get_all_lrs() -> List[dict]:
    db = SessionLocal()
    try:
        rows = db.query(LRModel).order_by(LRModel.id.desc()).all()
        return [_model_to_dict(r) for r in rows]
    finally:
        db.close()


def get_lr_by_id(lr_id: int) -> dict:
    db = SessionLocal()
    try:
        obj = db.query(LRModel).filter(LRModel.id == lr_id).first()
        if not obj:
            return None
        return _model_to_dict(obj)
    finally:
        db.close()


def update_lr(lr_id: int, payload: dict) -> dict:
    db = SessionLocal()
    try:
        obj = db.query(LRModel).filter(LRModel.id == lr_id).first()
        if not obj:
            return None
        
        for key, value in payload.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        
        db.commit()
        db.refresh(obj)
        return _model_to_dict(obj)
    finally:
        db.close()
