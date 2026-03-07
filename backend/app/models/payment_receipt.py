from sqlalchemy import Column, Date, DateTime, Integer, Numeric, String, Text, func

from ..db import Base, engine


class PaymentReceiptModel(Base):
    __tablename__ = "payment_receipts"

    id = Column(Integer, primary_key=True, index=True)
    payment_date = Column(Date, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False, default=0)
    received_from = Column(String(256), nullable=False)
    financial_year = Column(String(7), nullable=False, default="2025-26")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


def create_tables():
    Base.metadata.create_all(bind=engine)
