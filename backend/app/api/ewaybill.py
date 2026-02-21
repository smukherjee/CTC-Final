from fastapi import APIRouter, HTTPException, Query
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
def list_ewaybills(lr_id: int = Query(..., description='Filter by LR id')):
    return get_ewaybills_for_lr(lr_id)


@router.get('/ewaybill/{eway_id}', response_model=EWayBillResponse)
def get_eway(eway_id: int):
    e = get_ewaybill_by_id(eway_id)
    if not e:
        raise HTTPException(status_code=404, detail='EWayBill not found')
    return e


@router.post('/ewaybill/', response_model=EWayBillResponse)
def post_eway(payload: EWayBillCreate):
    try:
        return create_ewaybill(payload.dict())
    except ValueError as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))


@router.put('/ewaybill/{eway_id}', response_model=EWayBillResponse)
def put_eway(eway_id: int, payload: EWayBillUpdate):
    try:
        updated = update_ewaybill(eway_id, payload.dict(exclude_unset=True))
    except ValueError as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    if not updated:
        raise HTTPException(status_code=404, detail='EWayBill not found')
    return updated


@router.put('/ewaybill/{eway_id}/extend', response_model=EWayBillResponse)
def put_extend_eway(eway_id: int, payload: EWayBillUpdate):
    if not payload.valid_upto:
        raise HTTPException(status_code=400, detail='valid_upto is required to extend')
    try:
        updated = extend_ewaybill(eway_id, payload.valid_upto)
    except ValueError as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    if not updated:
        raise HTTPException(status_code=404, detail='EWayBill not found')
    return updated


@router.delete('/ewaybill/{eway_id}')
def remove_eway(eway_id: int):
    ok = delete_ewaybill(eway_id)
    if not ok:
        raise HTTPException(status_code=404, detail='EWayBill not found')
    return {'ok': True}
