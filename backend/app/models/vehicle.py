from sqlalchemy import Column, DateTime, Integer, String, Text, func
from ..db import engine, Base


class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(64), nullable=False, unique=True)
    type = Column(String(128), nullable=True)
    capacity = Column(String(64), nullable=True)
    owner_id = Column(Integer, nullable=True)
    status = Column(String(32), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
