from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint, func
from ..db import engine, Base


class CityModel(Base):
    __tablename__ = "cities"
    __table_args__ = (
        UniqueConstraint("name", "state", name="uq_cities_name_state"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    state = Column(String(128), nullable=True)
    code = Column(String(32), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
