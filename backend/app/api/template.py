from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..schemas.template import Template, TemplateCreate, TemplateUpdate
from ..services.template_service import (
    get_all_templates, get_template_by_id, create_template, update_template, delete_template
)

router = APIRouter(prefix="/template", tags=["template"])


@router.get("/", response_model=List[Template])
def list_templates(db: Session = Depends(get_db)):
    return get_all_templates(db)


@router.get("/{template_id}", response_model=Template)
def get_template(template_id: int, db: Session = Depends(get_db)):
    t = get_template_by_id(db, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return t


@router.post("/", response_model=Template)
def create_new_template(t: TemplateCreate, db: Session = Depends(get_db)):
    return create_template(db, t)


@router.put("/{template_id}", response_model=Template)
def update_existing_template(template_id: int, t: TemplateUpdate, db: Session = Depends(get_db)):
    return update_template(db, template_id, t)


@router.delete("/{template_id}")
def delete_existing_template(template_id: int, db: Session = Depends(get_db)):
    delete_template(db, template_id)
    return {"ok": True}
