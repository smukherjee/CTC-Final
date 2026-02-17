from typing import List, Optional
from ..schemas.template import Template, TemplateCreate, TemplateUpdate
from ..models.template import TemplateModel
from ..db import SessionLocal


def _model_to_template(m: TemplateModel) -> Template:
    return Template(id=m.id, name=m.name, description=m.description, file_url=m.file_url)


def get_all_templates() -> List[Template]:
    db = SessionLocal()
    try:
        rows = db.query(TemplateModel).all()
        return [_model_to_template(r) for r in rows]
    finally:
        db.close()


def get_template_by_id(template_id: int) -> Optional[Template]:
    db = SessionLocal()
    try:
        r = db.query(TemplateModel).filter(TemplateModel.id == template_id).first()
        return _model_to_template(r) if r else None
    finally:
        db.close()


def create_template(t: TemplateCreate) -> Template:
    db = SessionLocal()
    try:
        new = TemplateModel(**t.dict())
        db.add(new)
        db.commit()
        db.refresh(new)
        return _model_to_template(new)
    finally:
        db.close()


def update_template(template_id: int, t: TemplateUpdate) -> Template:
    db = SessionLocal()
    try:
        r = db.query(TemplateModel).filter(TemplateModel.id == template_id).first()
        if not r:
            raise KeyError("Template not found")
        for k, val in t.dict().items():
            if val is not None:
                setattr(r, k, val)
        db.add(r)
        db.commit()
        db.refresh(r)
        return _model_to_template(r)
    finally:
        db.close()


def delete_template(template_id: int) -> None:
    db = SessionLocal()
    try:
        db.query(TemplateModel).filter(TemplateModel.id == template_id).delete()
        db.commit()
    finally:
        db.close()
