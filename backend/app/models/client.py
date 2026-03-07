from sqlalchemy import Column, Integer, String, Text, Numeric
from ..db import engine, Base


class ClientModel(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    type = Column(String(64), nullable=False)
    gstin = Column(String(64), nullable=True)
    mobile = Column(String(64), nullable=True)
    address = Column(Text, nullable=True)
    tds_rate = Column(Numeric(5, 2), nullable=False, default=0)


def create_tables():
    Base.metadata.create_all(bind=engine)
