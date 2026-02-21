from fastapi import APIRouter, HTTPException
from ..schemas.lr import LRCreate, LRUpdate
from ..services.lr_service import (
    create_lr,
    get_all_lrs,
    get_lr_by_id,
    get_lr_by_number,
    update_lr,
    delete_lr,
    verify_lr_pod,
)

router = APIRouter()


@router.get('/lr/')
def list_lrs():
    return get_all_lrs()


@router.get('/lr/{lr_id}')
def get_lr(lr_id: int):
    lr = get_lr_by_id(lr_id)
    if not lr:
        raise HTTPException(status_code=404, detail="LR not found")
    return lr


@router.get('/lr/by-number/{lr_number}')
def get_lr_by_lr_number(lr_number: str):
    lr = get_lr_by_number(lr_number)
    if not lr:
        raise HTTPException(status_code=404, detail="LR not found")
    return lr


@router.post('/lr/')
def post_lr(payload: LRCreate):
    try:
        lr = create_lr(payload)
        return lr
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put('/lr/{lr_id}')
def put_lr(lr_id: int, payload: LRUpdate):
    try:
        updated = update_lr(lr_id, payload.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="LR not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete('/lr/{lr_id}')
def remove_lr(lr_id: int):
    deleted = delete_lr(lr_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="LR not found")
    return {"ok": True}


@router.post('/lr/{lr_id}/pod/verify')
def verify_pod(lr_id: int):
    try:
        updated = verify_lr_pod(lr_id)
        if not updated:
            raise HTTPException(status_code=404, detail="LR not found")
        return updated
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
