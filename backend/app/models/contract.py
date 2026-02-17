from sqlalchemy import Column, Integer, String, Date, Text
from ..db import engine, Base


class ContractModel(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    party_id = Column(Integer, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    expiry_alert_days = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
