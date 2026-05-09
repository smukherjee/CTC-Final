from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..db import get_db
from ..schemas.hirememo import HireMemo, HireMemoCreate, HireMemoUpdate
from ..services.hirememo_service import (
    get_all_hirememos,
    get_hirememo_by_id,
    create_hirememo,
    update_hirememo,
    log_hirememo_print,
)

router = APIRouter(prefix="/hirememo", tags=["hirememo"])


@router.get("/", response_model=List[HireMemo])
def list_hirememos(lr_id: Optional[int] = None, fy: Optional[str] = Query(default=None), db: Session = Depends(get_db)):
    return get_all_hirememos(db, lr_id=lr_id, fy=fy)


@router.get("/{hm_id}", response_model=HireMemo)
def get_hirememo(hm_id: int, db: Session = Depends(get_db)):
    hm = get_hirememo_by_id(db, hm_id)
    if not hm:
        raise HTTPException(status_code=404, detail="HireMemo not found")
    return hm


@router.post("/", response_model=HireMemo)
def create_new_hirememo(payload: HireMemoCreate, db: Session = Depends(get_db)):
    try:
        # Exclude hire_memo_no so service auto-assigns it
        data = payload.model_dump(exclude={'hire_memo_no'})
        return create_hirememo(db, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{hm_id}", response_model=HireMemo)
def update_existing_hirememo(hm_id: int, payload: HireMemoUpdate, db: Session = Depends(get_db)):
    hm = update_hirememo(db, hm_id, payload.model_dump(exclude_unset=True))
    if not hm:
        raise HTTPException(status_code=404, detail="HireMemo not found")
    return hm


@router.post("/{hm_id}/print")
def mark_hirememo_printed(hm_id: int, db: Session = Depends(get_db)):
    hm = log_hirememo_print(db, hm_id, user_name="system")
    if not hm:
        raise HTTPException(status_code=404, detail="HireMemo not found")
    return {"ok": True, "hirememo_id": hm_id}
