from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import or_

from ..db import SessionLocal
from ..models.file_upload import FileUploadModel
from ..models.hirememo import HireMemoModel
from ..models.lr import LRModel


ALLOWED_DOCUMENT_TYPES = {"LR", "INVOICE", "EWAY_BILL", "POD"}
ALLOWED_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png"}
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024
EWAY_BILL_MAX_UPLOAD_SIZE_BYTES = 1 * 1024 * 1024
RETENTION_DAYS = 365

BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_ROOT = BACKEND_ROOT / "storage" / "uploads"
ARCHIVE_ROOT = BACKEND_ROOT / "storage" / "archive"


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _safe_filename(name: str) -> str:
    cleaned = "".join(ch if ch.isalnum() or ch in ("-", "_", ".", " ") else "_" for ch in (name or ""))
    cleaned = cleaned.strip()
    return cleaned or "document"


def _ensure_storage_dirs() -> None:
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    ARCHIVE_ROOT.mkdir(parents=True, exist_ok=True)


def _to_document_dict(doc: FileUploadModel, lr: Optional[LRModel] = None) -> Dict[str, Any]:
    return {
        "id": doc.id,
        "document_type": doc.document_type,
        "lr_id": doc.lr_id,
        "hirememo_id": doc.hirememo_id,
        "original_filename": doc.original_filename,
        "file_url": doc.file_url,
        "content_type": doc.content_type,
        "file_size": doc.file_size,
        "checksum": doc.checksum,
        "uploaded_by": doc.uploaded_by,
        "is_archived": bool(doc.is_archived),
        "archived_at": doc.archived_at,
        "created_at": doc.created_at,
        "expires_at": doc.expires_at,
        "lr_number": lr.lr_number if lr else None,
        "consignor_name": lr.consignor_name if lr else None,
        "consignee_name": lr.consignee_name if lr else None,
        "pod_verified_at": lr.pod_verified_at if lr else None,
        "lr_status": lr.status if lr else None,
    }


def _save_upload(
    file_obj,
    filename: str,
    document_type: str,
    *,
    allowed_extensions: set[str],
    max_upload_size_bytes: int,
) -> Tuple[Path, int, str, str]:
    safe_name = _safe_filename(filename)
    ext = Path(safe_name).suffix.lower()
    if ext and ext not in allowed_extensions:
        allowed = ", ".join(sorted(allowed_extensions))
        raise ValueError(f"Unsupported file extension. Allowed: {allowed}")

    target_dir = UPLOAD_ROOT / document_type.lower() / _now_utc().strftime("%Y/%m")
    target_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{ext}"
    target_path = target_dir / stored_name

    size = 0
    digest = hashlib.sha256()
    try:
        with target_path.open("wb") as output:
            while True:
                chunk = file_obj.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > max_upload_size_bytes:
                    max_mb = max_upload_size_bytes // (1024 * 1024)
                    raise ValueError(f"File too large. Max size is {max_mb} MB")
                digest.update(chunk)
                output.write(chunk)
    except Exception:
        if target_path.exists():
            target_path.unlink()
        raise

    if size == 0:
        if target_path.exists():
            target_path.unlink()
        raise ValueError("Empty file is not allowed")

    return target_path, size, digest.hexdigest(), safe_name


def _archive_document_row(db, doc: FileUploadModel) -> FileUploadModel:
    if doc.is_archived:
        return doc

    src = Path(doc.storage_path)
    archive_name = f"{doc.id}_{doc.stored_filename}"
    dst = ARCHIVE_ROOT / archive_name
    dst.parent.mkdir(parents=True, exist_ok=True)

    if src.exists():
        src.replace(dst)
    doc.storage_path = str(dst)
    doc.is_archived = True
    doc.archived_at = _now_utc()
    db.add(doc)
    return doc


def apply_retention_policy() -> int:
    _ensure_storage_dirs()
    db = SessionLocal()
    try:
        now = _now_utc()
        expired = (
            db.query(FileUploadModel)
            .filter(FileUploadModel.is_archived.is_(False))
            .filter(FileUploadModel.expires_at.isnot(None))
            .filter(FileUploadModel.expires_at < now)
            .all()
        )
        for row in expired:
            _archive_document_row(db, row)
        if expired:
            db.commit()
        return len(expired)
    finally:
        db.close()


def upload_document(
    *,
    document_type: str,
    upload_file,
    lr_id: Optional[int] = None,
    hirememo_id: Optional[int] = None,
    uploaded_by: Optional[str] = None,
) -> Dict[str, Any]:
    _ensure_storage_dirs()
    normalized_type = (document_type or "").strip().upper()
    if normalized_type not in ALLOWED_DOCUMENT_TYPES:
        raise ValueError("Unsupported document_type. Allowed: LR, INVOICE, EWAY_BILL, POD")

    if not lr_id and not hirememo_id:
        raise ValueError("Either lr_id or hirememo_id is required")
    if normalized_type == "POD" and not lr_id:
        raise ValueError("POD upload requires lr_id")

    content_type = (upload_file.content_type or "").lower().strip()
    allowed_content_types = ALLOWED_CONTENT_TYPES
    allowed_extensions = ALLOWED_EXTENSIONS
    max_upload_size_bytes = MAX_UPLOAD_SIZE_BYTES

    if normalized_type == "EWAY_BILL":
        allowed_content_types = {"application/pdf"}
        allowed_extensions = {".pdf"}
        max_upload_size_bytes = EWAY_BILL_MAX_UPLOAD_SIZE_BYTES
        filename = (upload_file.filename or "").lower().strip()
        if not filename.endswith(".pdf"):
            raise ValueError("E-Way Bill upload must be a PDF file")

    if content_type and content_type not in allowed_content_types:
        if normalized_type == "EWAY_BILL":
            raise ValueError("E-Way Bill upload must be a PDF file")
        raise ValueError("Unsupported content type. Allowed: PDF/JPEG/PNG")

    db = SessionLocal()
    try:
        lr = None
        if lr_id:
            lr = db.query(LRModel).filter(LRModel.id == lr_id).first()
            if not lr:
                raise ValueError("LR not found")
        if hirememo_id:
            hirememo = db.query(HireMemoModel).filter(HireMemoModel.id == hirememo_id).first()
            if not hirememo:
                raise ValueError("Hire memo not found")

        path, size, checksum, safe_name = _save_upload(
            upload_file.file,
            upload_file.filename or "document",
            normalized_type,
            allowed_extensions=allowed_extensions,
            max_upload_size_bytes=max_upload_size_bytes,
        )

        expires_at = _now_utc() + timedelta(days=RETENTION_DAYS)
        doc = FileUploadModel(
            document_type=normalized_type,
            lr_id=lr_id,
            hirememo_id=hirememo_id,
            original_filename=safe_name,
            stored_filename=path.name,
            storage_path=str(path),
            file_url="",
            content_type=content_type or None,
            file_size=size,
            checksum=checksum,
            uploaded_by=(uploaded_by or "").strip() or None,
            expires_at=expires_at,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        doc.file_url = f"/api/files/{doc.id}/content"
        if normalized_type == "POD" and lr:
            lr.pod_url = doc.file_url
            lr.pod_verified_at = None
            lr.status = "POD_UPLOADED"
            db.add(lr)
        db.add(doc)
        db.commit()
        db.refresh(doc)
        if lr:
            db.refresh(lr)

        return _to_document_dict(doc, lr=lr)
    finally:
        db.close()


def list_documents(
    *,
    document_type: Optional[str] = None,
    lr_id: Optional[int] = None,
    hirememo_id: Optional[int] = None,
    q: Optional[str] = None,
    include_archived: bool = False,
) -> List[Dict[str, Any]]:
    apply_retention_policy()
    db = SessionLocal()
    try:
        query = db.query(FileUploadModel, LRModel).outerjoin(LRModel, FileUploadModel.lr_id == LRModel.id)
        if document_type:
            query = query.filter(FileUploadModel.document_type == document_type.strip().upper())
        if lr_id:
            query = query.filter(FileUploadModel.lr_id == lr_id)
        if hirememo_id:
            query = query.filter(FileUploadModel.hirememo_id == hirememo_id)
        if not include_archived:
            query = query.filter(FileUploadModel.is_archived.is_(False))
        if q:
            pattern = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    FileUploadModel.original_filename.ilike(pattern),
                    LRModel.lr_number.ilike(pattern),
                    LRModel.consignor_name.ilike(pattern),
                    LRModel.consignee_name.ilike(pattern),
                )
            )

        rows = query.order_by(FileUploadModel.created_at.desc()).all()
        return [_to_document_dict(doc, lr=lr) for doc, lr in rows]
    finally:
        db.close()


def get_document(document_id: int) -> Optional[Dict[str, Any]]:
    db = SessionLocal()
    try:
        row = (
            db.query(FileUploadModel, LRModel)
            .outerjoin(LRModel, FileUploadModel.lr_id == LRModel.id)
            .filter(FileUploadModel.id == document_id)
            .first()
        )
        if not row:
            return None
        doc, lr = row
        return _to_document_dict(doc, lr=lr)
    finally:
        db.close()


def get_document_path(document_id: int) -> Optional[Path]:
    db = SessionLocal()
    try:
        doc = db.query(FileUploadModel).filter(FileUploadModel.id == document_id).first()
        if not doc:
            return None
        path = Path(doc.storage_path)
        return path if path.exists() else None
    finally:
        db.close()


def archive_document(document_id: int) -> Optional[Dict[str, Any]]:
    _ensure_storage_dirs()
    db = SessionLocal()
    try:
        row = (
            db.query(FileUploadModel, LRModel)
            .outerjoin(LRModel, FileUploadModel.lr_id == LRModel.id)
            .filter(FileUploadModel.id == document_id)
            .first()
        )
        if not row:
            return None
        doc, lr = row
        _archive_document_row(db, doc)

        if lr and doc.document_type == "POD" and lr.pod_url == doc.file_url:
            lr.pod_url = None
            lr.pod_verified_at = None
            if lr.status in ("POD_UPLOADED", "POD_VERIFIED"):
                lr.status = "DELIVERED"
            db.add(lr)

        db.commit()
        db.refresh(doc)
        if lr:
            db.refresh(lr)
        return _to_document_dict(doc, lr=lr)
    finally:
        db.close()
