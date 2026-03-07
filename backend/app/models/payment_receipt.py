from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func

from ..db import Base, engine


class PaymentReceiptModel(Base):
    __tablename__ = "payment_receipts"

    id = Column(Integer, primary_key=True, index=True)
    payment_date = Column(Date, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False, default=0)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    received_from_id = Column(Integer, ForeignKey("clients.id"), nullable=True, index=True)
    received_from = Column(String(256), nullable=False)
    total_billed_amount = Column(Numeric(12, 2), nullable=False, default=0)
    tds_deducted = Column(Numeric(12, 2), nullable=False, default=0)
    net_amount = Column(Numeric(12, 2), nullable=False, default=0)
    other_deduction = Column(Numeric(12, 2), nullable=False, default=0)
    deduction_remarks = Column(Text, nullable=True)
    payment_mode = Column(String(32), nullable=False, default="BANK")
    financial_year = Column(String(7), nullable=False, default="2025-26")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


def create_tables():
    Base.metadata.create_all(bind=engine)
