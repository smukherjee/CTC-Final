"""create payment_receipts table

Revision ID: 20260305_08
Revises: 20260305_07
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "20260305_08"
down_revision = "20260305_07"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "payment_receipts" in tables:
        return

    op.create_table(
        "payment_receipts",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("received_from", sa.String(length=256), nullable=False),
        sa.Column("financial_year", sa.String(length=7), nullable=False, server_default="2025-26"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_payment_receipts_id", "payment_receipts", ["id"], unique=False)


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "payment_receipts" in tables:
        try:
            op.drop_index("ix_payment_receipts_id", table_name="payment_receipts")
        except Exception:
            pass
        op.drop_table("payment_receipts")
