from pydantic import BaseModel
from typing import Optional


class Template(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    file_url: Optional[str] = None


class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    file_url: Optional[str] = None


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
