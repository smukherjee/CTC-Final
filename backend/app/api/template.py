from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.template import Template, TemplateCreate, TemplateUpdate
from ..services.template_service import (
    get_all_templates, get_template_by_id, create_template, update_template, delete_template
)

router = APIRouter(prefix="/template", tags=["template"])


@router.get("/", response_model=List[Template])
def list_templates():
    return get_all_templates()


@router.get("/{template_id}", response_model=Template)
def get_template(template_id: int):
    t = get_template_by_id(template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return t


@router.post("/", response_model=Template)
def create_new_template(t: TemplateCreate):
    return create_template(t)


@router.put("/{template_id}", response_model=Template)
def update_existing_template(template_id: int, t: TemplateUpdate):
    return update_template(template_id, t)


@router.delete("/{template_id}")
def delete_existing_template(template_id: int):
    delete_template(template_id)
    return {"ok": True}
