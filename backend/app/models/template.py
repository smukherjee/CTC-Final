from sqlalchemy import Column, Integer, String, Text
from ..db import engine, Base


class TemplateModel(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(1024), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
