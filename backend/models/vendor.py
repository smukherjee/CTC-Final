from sqlalchemy import Column, Integer, String, Text
from sqlalchemy import Text as SaText
from ..db.db import engine
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class VendorModel(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    type = Column(String(64), nullable=False)
    gst_no = Column(String(64), nullable=True)
    contact = Column(String(64), nullable=True)
    address = Column(Text, nullable=True)
    tds_certificate_url = Column(String(1024), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
