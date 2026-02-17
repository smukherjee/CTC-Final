from sqlalchemy import Column, Integer, String, Text
from ..db import engine, Base


class VendorModel(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    type = Column(String(64), nullable=False)
    gstin = Column(String(64), nullable=True)
    mobile = Column(String(64), nullable=True)
    address = Column(Text, nullable=True)
    tds_certificate_url = Column(String(1024), nullable=True)
    pan = Column(String(64), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
