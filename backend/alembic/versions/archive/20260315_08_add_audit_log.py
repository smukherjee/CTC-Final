"""Add audit_log table for financial compliance

Captures who created, modified, or deleted LRs, invoices, payment receipts,
hire memos, and vouchers — with a before/after JSON snapshot.

Revision ID: 20260315_08
Revises: 20260315_07
Create Date: 2026-03-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260315_08"
down_revision = "20260315_07"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "audit_log",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("entity_type", sa.String(64), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(16), nullable=False),   # CREATE, UPDATE, DELETE
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("user_name", sa.String(128), nullable=True),
        sa.Column("before_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("after_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_audit_log_entity", "audit_log", ["entity_type", "entity_id"])
    op.create_index("ix_audit_log_created_at", "audit_log", ["created_at"])


def downgrade():
    op.drop_index("ix_audit_log_created_at", "audit_log")
    op.drop_index("ix_audit_log_entity", "audit_log")
    op.drop_table("audit_log")
