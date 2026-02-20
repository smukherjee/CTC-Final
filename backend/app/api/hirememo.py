from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.hirememo import HireMemo, HireMemoCreate, HireMemoUpdate
from ..services.hirememo_service import get_all_hirememos, get_hirememo_by_id, create_hirememo, update_hirememo

router = APIRouter(prefix="/hirememo", tags=["hirememo"])


@router.get("/", response_model=List[HireMemo])
def list_hirememos(lr_id: int | None = None):
    return get_all_hirememos(lr_id=lr_id)


@router.get("/{hm_id}", response_model=HireMemo)
def get_hirememo(hm_id: int):
    hm = get_hirememo_by_id(hm_id)
    if not hm:
        raise HTTPException(status_code=404, detail="HireMemo not found")
    return hm


@router.post("/", response_model=HireMemo)
def create_new_hirememo(payload: HireMemoCreate):
    try:
        return create_hirememo(payload.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{hm_id}", response_model=HireMemo)
def update_existing_hirememo(hm_id: int, payload: HireMemoUpdate):
    hm = update_hirememo(hm_id, payload.dict(exclude_unset=True))
    if not hm:
        raise HTTPException(status_code=404, detail="HireMemo not found")
    return hm
