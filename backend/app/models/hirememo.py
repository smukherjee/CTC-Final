from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, func, Date
from ..db import engine, Base


class HireMemoModel(Base):
    __tablename__ = "hirememos"

    id = Column(Integer, primary_key=True, index=True)
    lr_id = Column(Integer, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False, default=0)
    advance_cash = Column(Numeric(12, 2), nullable=True, default=0)
    advance_bank = Column(Numeric(12, 2), nullable=True, default=0)
    # new payment tracking
    advance_payment_date = Column(Date, nullable=True)
    balance = Column(Numeric(12, 2), nullable=True)
    balance_payment_date = Column(Date, nullable=True)
    driver_name = Column(String(128), nullable=True)
    driver_mobile = Column(String(32), nullable=True)
    driver_license = Column(String(64), nullable=True)
    
    # Meta
    hire_memo_no = Column(String(64), nullable=True)
    hire_memo_date = Column(Date, nullable=True)
    branch = Column(String(64), nullable=True)

    # Vehicle (Snapshot + Link)
    vehicle_id = Column(Integer, nullable=True) # ForeignKey('vehicles.id')
    vehicle_number = Column(String(32), nullable=True)

    # Route
    from_location = Column(String(128), nullable=True)
    to_location = Column(String(128), nullable=True)
    payment_location = Column(String(128), nullable=True)

    # Financials
    rate_type = Column(String(32), nullable=True) # FIXED, PER_TON
    freight_rate = Column(Numeric(12, 2), nullable=True)
    freight_weight = Column(Numeric(12, 2), nullable=True)
    guaranteed_weight = Column(Numeric(12, 2), nullable=True)
    
    # Deductions
    commission = Column(Numeric(12, 2), nullable=True, default=0)
    hamali = Column(Numeric(12, 2), nullable=True, default=0)
    mamul = Column(Numeric(12, 2), nullable=True, default=0)
    other_deductions = Column(Numeric(12, 2), nullable=True, default=0)

    ack_status = Column(String(32), nullable=False, default='PENDING')
    notes = Column(Text, nullable=True)

    # Financial year scoping
    financial_year = Column(String(7), nullable=False, default='2025-26')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


def create_tables():
    Base.metadata.create_all(bind=engine)
