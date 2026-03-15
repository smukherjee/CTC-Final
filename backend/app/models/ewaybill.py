from sqlalchemy import Column, ForeignKey, Integer, String, Date, DateTime, Boolean, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from ..db import engine, Base


class EWayBillModel(Base):
    __tablename__ = 'eway_bills'

    id = Column(Integer, primary_key=True, index=True)
    lr_id = Column(Integer, ForeignKey("lrs.id", ondelete="CASCADE"), nullable=False, index=True)
    number = Column(String(128), nullable=False)
    valid_from = Column(Date, nullable=True)
    valid_upto = Column(Date, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(32), nullable=True)
    alert_sent = Column(Boolean, default=False)
    file_url = Column(String(1024), nullable=True)
    extension_count = Column(Integer, nullable=False, default=0)
    last_extended_at = Column(DateTime(timezone=True), nullable=True)
    meta = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=True, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    # Relationships
    lr = relationship("LRModel", back_populates="eway_bills")


def create_tables():
    Base.metadata.create_all(bind=engine)
