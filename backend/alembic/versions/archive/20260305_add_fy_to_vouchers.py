"""add financial_year to vouchers

Revision ID: 20260305_10
Revises: 20260305_09
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "20260305_10"
down_revision = "20260305_09"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "vouchers" not in tables:
        return

    cols = {c["name"] for c in inspector.get_columns("vouchers")}
    if "financial_year" not in cols:
        op.add_column(
            "vouchers",
            sa.Column("financial_year", sa.String(length=7), nullable=False, server_default="2025-26"),
        )
    try:
        op.create_index("ix_vouchers_financial_year", "vouchers", ["financial_year"], unique=False)
    except Exception:
        pass


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "vouchers" not in tables:
        return
    try:
        op.drop_index("ix_vouchers_financial_year", table_name="vouchers")
    except Exception:
        pass
    try:
        op.drop_column("vouchers", "financial_year")
    except Exception:
        pass
