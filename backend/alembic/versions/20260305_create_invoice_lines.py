"""create invoice_lines table

Revision ID: 20260305_07
Revises: 20260305_06
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "20260305_07"
down_revision = "20260305_06"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "invoice_lines" in tables:
        return

    op.create_table(
        "invoice_lines",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("invoice_id", sa.Integer(), nullable=False),
        sa.Column("lr_id", sa.Integer(), nullable=True),
        sa.Column("s_no", sa.Integer(), nullable=True),
        sa.Column("lr_no", sa.String(length=64), nullable=True),
        sa.Column("lr_date", sa.Date(), nullable=True),
        sa.Column("qty", sa.Numeric(12, 2), nullable=True),
        sa.Column("particulars", sa.Text(), nullable=True),
        sa.Column("v_type", sa.String(length=64), nullable=True),
        sa.Column("vehicle_no", sa.String(length=32), nullable=True),
        sa.Column("consignor", sa.String(length=256), nullable=True),
        sa.Column("consignee", sa.String(length=256), nullable=True),
        sa.Column("from_city", sa.String(length=100), nullable=True),
        sa.Column("to_city", sa.String(length=100), nullable=True),
        sa.Column("freight", sa.Numeric(12, 2), nullable=True, server_default="0"),
        sa.Column("loading_detention", sa.Numeric(12, 2), nullable=True, server_default="0"),
        sa.Column("unloading_charges", sa.Numeric(12, 2), nullable=True, server_default="0"),
        sa.Column("unloading_detention", sa.Numeric(12, 2), nullable=True, server_default="0"),
        sa.Column("other_charges", sa.Numeric(12, 2), nullable=True, server_default="0"),
        sa.Column("total", sa.Numeric(12, 2), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["invoice_id"], ["invoices.id"], ondelete="CASCADE", name="fk_invoice_lines_invoice_id"),
        sa.ForeignKeyConstraint(["lr_id"], ["lrs.id"], name="fk_invoice_lines_lr_id"),
    )
    op.create_index("ix_invoice_lines_id", "invoice_lines", ["id"], unique=False)


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "invoice_lines" in tables:
        try:
            op.drop_index("ix_invoice_lines_id", table_name="invoice_lines")
        except Exception:
            pass
        op.drop_table("invoice_lines")
