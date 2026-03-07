from typing import List, Optional
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from ..schemas.file_upload import FileUploadResponse
from ..services.files_service import (
    archive_document,
    get_document,
    get_document_path,
    list_documents,
    upload_document,
)

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=FileUploadResponse)
def upload_file_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    lr_id: Optional[int] = Form(None),
    hirememo_id: Optional[int] = Form(None),
    uploaded_by: Optional[str] = Form(None),
):
    try:
        return upload_document(
            document_type=document_type,
            upload_file=file,
            lr_id=lr_id,
            hirememo_id=hirememo_id,
            uploaded_by=uploaded_by,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/", response_model=List[FileUploadResponse])
def list_file_documents(
    document_type: Optional[str] = None,
    lr_id: Optional[int] = None,
    hirememo_id: Optional[int] = None,
    q: Optional[str] = None,
    fy: Optional[str] = None,
    include_archived: bool = False,
):
    return list_documents(
        document_type=document_type,
        lr_id=lr_id,
        hirememo_id=hirememo_id,
        q=q,
        fy=fy,
        include_archived=include_archived,
    )


@router.get("/{document_id}", response_model=FileUploadResponse)
def get_file_document(document_id: int):
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="File document not found")
    return doc


@router.get("/{document_id}/content")
def get_file_content(document_id: int):
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="File document not found")

    path = get_document_path(document_id)
    if not path:
        raise HTTPException(status_code=404, detail="Stored file not found on disk")

    media_type = doc.get("content_type") or "application/octet-stream"
    filename = doc.get("original_filename") or Path(path).name
    return FileResponse(path=str(path), media_type=media_type, filename=filename)


@router.post("/{document_id}/archive", response_model=FileUploadResponse)
def archive_file_document(document_id: int):
    archived = archive_document(document_id)
    if not archived:
        raise HTTPException(status_code=404, detail="File document not found")
    return archived
