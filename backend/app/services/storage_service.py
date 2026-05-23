from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from .files_service import list_documents, upload_document


def persist_pod_file_metadata(
    db: Session,
    *,
    lr_id: int,
    upload_file,
    uploaded_by: Optional[str] = None,
) -> Dict[str, Any]:
    """Persist POD document metadata and storage details via shared file service."""
    return upload_document(
        db,
        document_type="POD",
        upload_file=upload_file,
        lr_id=lr_id,
        uploaded_by=uploaded_by,
    )


def search_pod_documents(
    db: Session,
    *,
    fy: Optional[str] = None,
    q: Optional[str] = None,
    include_archived: bool = False,
) -> List[Dict[str, Any]]:
    """Return POD file metadata entries with optional FY and text filters."""
    return list_documents(
        db,
        document_type="POD",
        q=q,
        fy=fy,
        include_archived=include_archived,
    )
