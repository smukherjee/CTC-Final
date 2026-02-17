from sqlalchemy import Column, Integer, String, Text
from ..db import engine, Base


class CityModel(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    state = Column(String(128), nullable=True)
    code = Column(String(32), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
