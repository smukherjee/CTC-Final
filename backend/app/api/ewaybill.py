from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas.ewaybill import EWayBillCreate, EWayBillResponse, EWayBillUpdate
from ..services.ewaybill_service import (
    create_ewaybill,
    get_ewaybills_for_lr,
    get_ewaybill_by_id,
    update_ewaybill,
    extend_ewaybill,
    delete_ewaybill,
)

router = APIRouter()


@router.get('/ewaybill/', response_model=list[EWayBillResponse])
def list_ewaybills(lr_id: int = Query(..., description='Filter by LR id'), db: Session = Depends(get_db)):
    return get_ewaybills_for_lr(db, lr_id)


@router.get('/ewaybill/{eway_id}', response_model=EWayBillResponse)
def get_eway(eway_id: int, db: Session = Depends(get_db)):
    e = get_ewaybill_by_id(db, eway_id)
    if not e:
        raise HTTPException(status_code=404, detail='EWayBill not found')
    return e


@router.post('/ewaybill/', response_model=EWayBillResponse)
def post_eway(payload: EWayBillCreate, db: Session = Depends(get_db)):
    try:
        return create_ewaybill(db, payload.model_dump())
    except ValueError as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))


@router.put('/ewaybill/{eway_id}', response_model=EWayBillResponse)
def put_eway(eway_id: int, payload: EWayBillUpdate, db: Session = Depends(get_db)):
    try:
        updated = update_ewaybill(db, eway_id, payload.model_dump(exclude_unset=True))
    except ValueError as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    if not updated:
        raise HTTPException(status_code=404, detail='EWayBill not found')
    return updated


@router.put('/ewaybill/{eway_id}/extend', response_model=EWayBillResponse)
def put_extend_eway(eway_id: int, payload: EWayBillUpdate, db: Session = Depends(get_db)):
    if not payload.valid_upto:
        raise HTTPException(status_code=400, detail='valid_upto is required to extend')
    try:
        updated = extend_ewaybill(db, eway_id, payload.valid_upto)
    except ValueError as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    if not updated:
        raise HTTPException(status_code=404, detail='EWayBill not found')
    return updated


@router.delete('/ewaybill/{eway_id}')
def remove_eway(eway_id: int, db: Session = Depends(get_db)):
    ok = delete_ewaybill(db, eway_id)
    if not ok:
        raise HTTPException(status_code=404, detail='EWayBill not found')
    return {'ok': True}
