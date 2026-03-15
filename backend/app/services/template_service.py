from typing import List, Optional

from sqlalchemy.orm import Session

from ..schemas.template import Template, TemplateCreate, TemplateUpdate
from ..models.template import TemplateModel


def _model_to_template(m: TemplateModel) -> Template:
    return Template(id=m.id, name=m.name, description=m.description, file_url=m.file_url)


def get_all_templates(db: Session) -> List[Template]:
    rows = db.query(TemplateModel).all()
    return [_model_to_template(r) for r in rows]


def get_template_by_id(db: Session, template_id: int) -> Optional[Template]:
    r = db.query(TemplateModel).filter(TemplateModel.id == template_id).first()
    return _model_to_template(r) if r else None


def create_template(db: Session, t: TemplateCreate) -> Template:
    new = TemplateModel(**t.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    return _model_to_template(new)


def update_template(db: Session, template_id: int, t: TemplateUpdate) -> Template:
    r = db.query(TemplateModel).filter(TemplateModel.id == template_id).first()
    if not r:
        raise KeyError("Template not found")
    for k, val in t.model_dump(exclude_unset=True).items():
        setattr(r, k, val)
    db.add(r)
    db.commit()
    db.refresh(r)
    return _model_to_template(r)


def delete_template(db: Session, template_id: int) -> None:
    db.query(TemplateModel).filter(TemplateModel.id == template_id).delete()
    db.commit()
