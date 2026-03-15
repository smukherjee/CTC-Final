from sqlalchemy import BigInteger, Column, DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB

from ..db import Base


class AuditLogModel(Base):
    __tablename__ = "audit_log"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(Integer, nullable=True)
    action = Column(String(16), nullable=False)  # CREATE, UPDATE, DELETE
    user_id = Column(Integer, nullable=True)
    user_name = Column(String(128), nullable=True)
    before_data = Column(JSONB, nullable=True)
    after_data = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
