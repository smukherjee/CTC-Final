from sqlalchemy import Column, DateTime, Integer, String, Date, Text, func
from ..db import engine, Base


class ContractModel(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    client_id = Column(Integer, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    expiry_alert_days = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
