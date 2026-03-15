from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..db import get_db
from ..schemas.lr import LRCreate, LRUpdate, LREwayBillPatch, LRPodPatch
from ..services.lr_service import (
    create_lr,
    get_all_lrs,
    get_lr_by_id,
    get_lr_by_number,
    update_lr,
    delete_lr,
    verify_lr_pod,
    patch_lr_eway,
    patch_lr_pod,
    get_eway_expiring,
)

router = APIRouter()


@router.get('/lr/eway-expiring')
def list_eway_expiring(
    hours: int = Query(default=8, ge=1, le=24 * 31),
    months: Optional[int] = Query(default=None, ge=1, le=12),
    db: Session = Depends(get_db),
):
    return get_eway_expiring(db, hours=hours, months=months)


@router.get('/lr/')
def list_lrs(
    fy: Optional[str] = Query(default=None),
    client_id: Optional[int] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    return get_all_lrs(db, fy=fy, client_id=client_id, skip=skip, limit=limit)


@router.get('/lr/{lr_id}')
def get_lr(lr_id: int, db: Session = Depends(get_db)):
    lr = get_lr_by_id(db, lr_id)
    if not lr:
        raise HTTPException(status_code=404, detail="LR not found")
    return lr


@router.get('/lr/by-number/{lr_number}')
def get_lr_by_lr_number(lr_number: str, db: Session = Depends(get_db)):
    lr = get_lr_by_number(db, lr_number)
    if not lr:
        raise HTTPException(status_code=404, detail="LR not found")
    return lr


@router.post('/lr/')
def post_lr(payload: LRCreate, db: Session = Depends(get_db)):
    try:
        lr = create_lr(db, payload)
        return lr
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put('/lr/{lr_id}')
def put_lr(lr_id: int, payload: LRUpdate, db: Session = Depends(get_db)):
    try:
        updated = update_lr(db, lr_id, payload.model_dump(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="LR not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch('/lr/{lr_id}')
def patch_lr(lr_id: int, payload: LREwayBillPatch, db: Session = Depends(get_db)):
    try:
        updated = patch_lr_eway(
            db,
            lr_id,
            eway_bill_no=payload.eway_bill_no,
            eway_bill_expiry=payload.eway_bill_expiry,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="LR not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch('/lr/{lr_id}/pod')
def patch_pod(lr_id: int, payload: LRPodPatch, db: Session = Depends(get_db)):
    try:
        updated = patch_lr_pod(db, lr_id, pod_received=payload.pod_received, pod_file_id=payload.pod_file_id)
        if not updated:
            raise HTTPException(status_code=404, detail="LR not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete('/lr/{lr_id}')
def remove_lr(lr_id: int, db: Session = Depends(get_db)):
    try:
        deleted = delete_lr(db, lr_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="LR not found")
        return {"ok": True}
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post('/lr/{lr_id}/pod/verify')
def verify_pod(lr_id: int, db: Session = Depends(get_db)):
    try:
        updated = verify_lr_pod(db, lr_id)
        if not updated:
            raise HTTPException(status_code=404, detail="LR not found")
        return updated
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
