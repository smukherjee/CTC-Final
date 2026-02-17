from sqlalchemy import Column, Integer, String, Text
from ..db import engine, Base


class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(64), nullable=False)
    type = Column(String(128), nullable=True)
    capacity = Column(String(64), nullable=True)
    owner_id = Column(Integer, nullable=True)
    status = Column(String(32), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
