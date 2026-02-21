from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    id: int
    document_type: str
    lr_id: Optional[int] = None
    hirememo_id: Optional[int] = None
    original_filename: str
    file_url: str
    content_type: Optional[str] = None
    file_size: int
    checksum: Optional[str] = None
    uploaded_by: Optional[str] = None
    is_archived: bool
    archived_at: Optional[datetime] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    lr_number: Optional[str] = None
    consignor_name: Optional[str] = None
    consignee_name: Optional[str] = None
    pod_verified_at: Optional[datetime] = None
    lr_status: Optional[str] = None

    class Config:
        orm_mode = True
