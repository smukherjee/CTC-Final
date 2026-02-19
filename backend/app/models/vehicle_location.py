from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from ..db import Base


class VehicleLocationModel(Base):
    __tablename__ = "vehicle_locations"

    id = Column(Integer, primary_key=True, index=True)
    lr_id = Column(Integer, ForeignKey("lrs.id"), nullable=True, index=True)
    vehicle_number = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)  # Current location or status
    reported_by = Column(String, nullable=True)  # User who reported
    reported_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
