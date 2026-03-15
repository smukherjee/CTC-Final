"""create vouchers table

Revision ID: 20260305_09
Revises: 20260305_08
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "20260305_09"
down_revision = "20260305_08"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "vouchers" in tables:
        return

    op.create_table(
        "vouchers",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("voucher_type", sa.String(length=64), nullable=False),
        sa.Column("reference_id", sa.Integer(), nullable=True),
        sa.Column("reference_type", sa.String(length=64), nullable=True),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("narration", sa.Text(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_vouchers_id", "vouchers", ["id"], unique=False)


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "vouchers" in tables:
        try:
            op.drop_index("ix_vouchers_id", table_name="vouchers")
        except Exception:
            pass
        op.drop_table("vouchers")
