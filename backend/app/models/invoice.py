from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from ..db import Base, engine


class InvoiceModel(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        UniqueConstraint("invoice_no", "financial_year", name="uq_invoices_no_fy"),
    )

    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String(64), nullable=False)
    invoice_date = Column(Date, nullable=False)
    client_id = Column(Integer, nullable=False)
    financial_year = Column(String(7), nullable=False, default="2025-26")
    po_no = Column(String(64), nullable=True)
    po_date = Column(Date, nullable=True)
    hsn_code = Column(String(16), nullable=True, default="996791")
    reverse_charge = Column(Boolean, nullable=True, default=False)
    gst_paid_by = Column(String(64), nullable=True)
    total_amount = Column(Numeric(12, 2), nullable=True, default=0)
    tds_amount = Column(Numeric(12, 2), nullable=True, default=0)
    net_amount = Column(Numeric(12, 2), nullable=True, default=0)
    status = Column(String(32), nullable=True, default="draft")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    lines = relationship("InvoiceLineModel", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceLineModel(Base):
    __tablename__ = "invoice_lines"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    lr_id = Column(Integer, ForeignKey("lrs.id"), nullable=True)
    s_no = Column(Integer, nullable=True)
    lr_no = Column(String(64), nullable=True)
    lr_date = Column(Date, nullable=True)
    qty = Column(Numeric(12, 2), nullable=True)
    particulars = Column(Text, nullable=True)
    v_type = Column(String(64), nullable=True)
    vehicle_no = Column(String(32), nullable=True)
    consignor = Column(String(256), nullable=True)
    consignee = Column(String(256), nullable=True)
    from_city = Column(String(100), nullable=True)
    to_city = Column(String(100), nullable=True)
    freight = Column(Numeric(12, 2), nullable=True, default=0)
    loading_detention = Column(Numeric(12, 2), nullable=True, default=0)
    unloading_charges = Column(Numeric(12, 2), nullable=True, default=0)
    unloading_detention = Column(Numeric(12, 2), nullable=True, default=0)
    other_charges = Column(Numeric(12, 2), nullable=True, default=0)
    total = Column(Numeric(12, 2), nullable=True, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    invoice = relationship("InvoiceModel", back_populates="lines")


def create_tables():
    Base.metadata.create_all(bind=engine)
