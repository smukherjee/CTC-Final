from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Numeric, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from ..db import engine, Base


class LRModel(Base):
    __tablename__ = 'lrs'

    id = Column(Integer, primary_key=True, index=True)
    lr_number = Column(String(64), nullable=False, unique=True)
    date = Column(Date, nullable=True)
    consignor_id = Column(String(64), nullable=True)
    consignor_name = Column(String(256), nullable=True)
    consignee_id = Column(String(64), nullable=True)
    consignee_name = Column(String(256), nullable=True)

    origin = Column(String(128), nullable=True)
    destination = Column(String(128), nullable=True)
    delivery_at = Column(String(256), nullable=True)

    through_id = Column(Integer, nullable=True)
    through = Column(String(256), nullable=True)
    fob = Column(String(128), nullable=True)

    goods_items = Column(JSONB, nullable=True)
    articles_count = Column(Integer, nullable=True)
    articles_description = Column(Text, nullable=True)
    weight = Column(Numeric(12, 2), nullable=True)
    freight_amount = Column(Numeric(12, 2), nullable=True)

    status = Column(String(64), nullable=False, default='DRAFT')

    # Vehicle Details
    vehicle_id = Column(Integer, nullable=True) # ForeignKey('vehicles.id') - loose coupling for now or strict? Plan said FK.
    vehicle_number = Column(String(32), nullable=True)
    vehicle_type = Column(String(64), nullable=True)
    seal_number = Column(String(64), nullable=True)
    driver_name = Column(String(128), nullable=True)
    driver_mobile = Column(String(32), nullable=True)

    # Risk & Logistics
    booked_on_owners_risk = Column(Boolean, default=False)
    loading_point_times = Column(JSONB, nullable=True) # in_date, in_time, out_date, out_time

    # Financials
    value_rs = Column(Numeric(12, 2), nullable=True) # Goods Value
    surcharge = Column(Numeric(12, 2), nullable=True)
    hamali_charges = Column(Numeric(12, 2), nullable=True)
    st_charges = Column(Numeric(12, 2), nullable=True)
    total = Column(Numeric(12, 2), nullable=True) # Grand Total

    # Dispatch Register & Compliance
    bill_number = Column(String(64), nullable=True)
    bill_date = Column(Date, nullable=True)
    amount_passed = Column(Numeric(12, 2), nullable=True)
    deductions = Column(String(256), nullable=True)
    cm_no = Column(String(64), nullable=True)
    cm_date = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    # eway_bill JSONB deprecated — data migrated to eway_bills table (migration 20260315_07)
    # Column dropped from ORM; kept in DB until migration runs.
    pod_url = Column(String(1024), nullable=True)
    pod_verified_at = Column(DateTime(timezone=True), nullable=True)
    pod_received = Column(Boolean, nullable=False, default=False)
    pod_file_id = Column(Integer, nullable=True)

    # E-way bill inline fields
    eway_bill_no = Column(String(64), nullable=True)
    eway_bill_expiry = Column(DateTime(timezone=True), nullable=True)

    # Financial year scoping
    financial_year = Column(String(7), nullable=False, default='2025-26')
    # FOB client link
    fob_client_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    eway_bills = relationship("EWayBillModel", back_populates="lr", cascade="all, delete-orphan")
    lr_deductions = relationship("LRDeductionModel", back_populates="lr", cascade="all, delete-orphan")


class LRDeductionModel(Base):
    __tablename__ = 'lr_deductions'

    id = Column(Integer, primary_key=True, index=True)
    lr_id = Column(Integer, ForeignKey('lrs.id', ondelete='CASCADE'), nullable=False, index=True)
    deduction_label = Column(String(128), nullable=False)
    deduction_amount = Column(Numeric(12, 2), nullable=False, default=0)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    lr = relationship("LRModel", back_populates="lr_deductions")


def create_tables():
    Base.metadata.create_all(bind=engine)
