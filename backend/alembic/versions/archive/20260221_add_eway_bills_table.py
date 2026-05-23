"""add eway_bills table with extension/expiry metadata

Revision ID: 20260221_02
Revises: 20260221_01
Create Date: 2026-02-21 11:20:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "20260221_02"
down_revision = "20260221_01"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = set(inspector.get_table_names())

    if "eway_bills" not in tables:
        op.create_table(
            "eway_bills",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("lr_id", sa.Integer(), nullable=False),
            sa.Column("number", sa.String(length=128), nullable=False),
            sa.Column("valid_from", sa.Date(), nullable=True),
            sa.Column("valid_upto", sa.Date(), nullable=True),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("status", sa.String(length=32), nullable=True),
            sa.Column("alert_sent", sa.Boolean(), nullable=False, server_default="false"),
            sa.Column("file_url", sa.String(length=1024), nullable=True),
            sa.Column("extension_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("last_extended_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("meta", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index("ix_eway_bills_id", "eway_bills", ["id"])
        op.create_index("ix_eway_bills_lr_id", "eway_bills", ["lr_id"])
    else:
        cols = {c["name"] for c in inspector.get_columns("eway_bills")}
        if "expires_at" not in cols:
            op.add_column("eway_bills", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True))
        if "extension_count" not in cols:
            op.add_column("eway_bills", sa.Column("extension_count", sa.Integer(), nullable=False, server_default="0"))
        if "last_extended_at" not in cols:
            op.add_column("eway_bills", sa.Column("last_extended_at", sa.DateTime(timezone=True), nullable=True))
        if "meta" not in cols:
            op.add_column("eway_bills", sa.Column("meta", postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = set(inspector.get_table_names())
    if "eway_bills" not in tables:
        return

    op.drop_index("ix_eway_bills_lr_id", table_name="eway_bills")
    op.drop_index("ix_eway_bills_id", table_name="eway_bills")
    op.drop_table("eway_bills")
