from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from ..db import engine, Base


class EWayBillModel(Base):
    __tablename__ = 'eway_bills'

    id = Column(Integer, primary_key=True, index=True)
    lr_id = Column(Integer, nullable=False, index=True)
    number = Column(String(128), nullable=False)
    valid_from = Column(Date, nullable=True)
    valid_upto = Column(Date, nullable=True)
    status = Column(String(32), nullable=True)
    alert_sent = Column(Boolean, default=False)
    file_url = Column(String(1024), nullable=True)
    meta = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
