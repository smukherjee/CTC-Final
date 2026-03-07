from sqlalchemy import Column, Date, DateTime, Integer, Numeric, String, Text, func

from ..db import Base, engine


class VoucherModel(Base):
    __tablename__ = "vouchers"

    id = Column(Integer, primary_key=True, index=True)
    voucher_type = Column(String(64), nullable=False)
    reference_id = Column(Integer, nullable=True)
    reference_type = Column(String(64), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False, default=0)
    narration = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    financial_year = Column(String(7), nullable=False, default="2025-26")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


def create_tables():
    Base.metadata.create_all(bind=engine)
