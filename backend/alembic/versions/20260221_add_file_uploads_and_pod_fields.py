"""add file_uploads table and pod fields on lrs

Revision ID: 20260221_01
Revises: 20260220_02
Create Date: 2026-02-21 09:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260221_01"
down_revision = "20260220_02"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = set(inspector.get_table_names())

    if "file_uploads" not in tables:
        op.create_table(
            "file_uploads",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("document_type", sa.String(length=64), nullable=False),
            sa.Column("lr_id", sa.Integer(), nullable=True),
            sa.Column("hirememo_id", sa.Integer(), nullable=True),
            sa.Column("original_filename", sa.String(length=512), nullable=False),
            sa.Column("stored_filename", sa.String(length=256), nullable=False),
            sa.Column("storage_path", sa.String(length=1024), nullable=False),
            sa.Column("file_url", sa.String(length=1024), nullable=False),
            sa.Column("content_type", sa.String(length=128), nullable=True),
            sa.Column("file_size", sa.Integer(), nullable=False),
            sa.Column("checksum", sa.String(length=64), nullable=True),
            sa.Column("uploaded_by", sa.String(length=128), nullable=True),
            sa.Column("is_archived", sa.Boolean(), nullable=False, server_default="false"),
            sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index("ix_file_uploads_document_type", "file_uploads", ["document_type"])
        op.create_index("ix_file_uploads_lr_id", "file_uploads", ["lr_id"])
        op.create_index("ix_file_uploads_hirememo_id", "file_uploads", ["hirememo_id"])

    if "lrs" in tables:
        lr_cols = {c["name"] for c in inspector.get_columns("lrs")}
        if "pod_url" not in lr_cols:
            op.add_column("lrs", sa.Column("pod_url", sa.String(length=1024), nullable=True))
        if "pod_verified_at" not in lr_cols:
            op.add_column("lrs", sa.Column("pod_verified_at", sa.DateTime(timezone=True), nullable=True))


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = set(inspector.get_table_names())

    if "lrs" in tables:
        lr_cols = {c["name"] for c in inspector.get_columns("lrs")}
        if "pod_verified_at" in lr_cols:
            op.drop_column("lrs", "pod_verified_at")
        if "pod_url" in lr_cols:
            op.drop_column("lrs", "pod_url")

    if "file_uploads" in tables:
        op.drop_index("ix_file_uploads_hirememo_id", table_name="file_uploads")
        op.drop_index("ix_file_uploads_lr_id", table_name="file_uploads")
        op.drop_index("ix_file_uploads_document_type", table_name="file_uploads")
        op.drop_table("file_uploads")
