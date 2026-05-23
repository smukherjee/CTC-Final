from sqlalchemy import Column, Integer, String, DateTime, Boolean, func
from ..db import Base


class FileUploadModel(Base):
    __tablename__ = "file_uploads"

    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String(64), nullable=False, index=True)
    lr_id = Column(Integer, nullable=True, index=True)
    hirememo_id = Column(Integer, nullable=True, index=True)

    original_filename = Column(String(512), nullable=False)
    stored_filename = Column(String(256), nullable=False)
    storage_path = Column(String(1024), nullable=False)
    file_url = Column(String(1024), nullable=False)
    content_type = Column(String(128), nullable=True)
    file_size = Column(Integer, nullable=False)
    checksum = Column(String(64), nullable=True)
    uploaded_by = Column(String(128), nullable=True)

    is_archived = Column(Boolean, nullable=False, server_default="false")
    archived_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
