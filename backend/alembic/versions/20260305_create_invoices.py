"""create invoices table

Revision ID: 20260305_06
Revises: 20260305_05
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "20260305_06"
down_revision = "20260305_05"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if "invoices" not in tables:
        op.create_table(
            "invoices",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("invoice_no", sa.String(length=64), nullable=False),
            sa.Column("invoice_date", sa.Date(), nullable=False),
            sa.Column("party_id", sa.Integer(), nullable=False),
            sa.Column("financial_year", sa.String(length=7), nullable=False, server_default="2025-26"),
            sa.Column("po_no", sa.String(length=64), nullable=True),
            sa.Column("po_date", sa.Date(), nullable=True),
            sa.Column("hsn_code", sa.String(length=16), nullable=False, server_default="996791"),
            sa.Column("reverse_charge", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.Column("gst_paid_by", sa.String(length=64), nullable=True),
            sa.Column("total_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
            sa.Column("tds_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
            sa.Column("net_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="draft"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.UniqueConstraint("invoice_no", "financial_year", name="uq_invoices_invoice_no_fy"),
        )
        op.create_index("ix_invoices_id", "invoices", ["id"], unique=False)
    else:
        existing_unique = {u["name"] for u in inspector.get_unique_constraints("invoices")}
        if "uq_invoices_invoice_no_fy" not in existing_unique:
            op.create_unique_constraint("uq_invoices_invoice_no_fy", "invoices", ["invoice_no", "financial_year"])


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "invoices" in tables:
        try:
            op.drop_index("ix_invoices_id", table_name="invoices")
        except Exception:
            pass
        op.drop_table("invoices")
