"""link payment receipts to invoices and unify heads

Revision ID: 20260307_03
Revises: 20260307_add_paydates, 20260307_01, 20260307_02
Create Date: 2026-03-07 14:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "20260307_03"
down_revision = ("20260307_add_paydates", "20260307_01", "20260307_02")
branch_labels = None
depends_on = None


def _columns(inspector, table_name: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table_name)}


def _indexes(inspector, table_name: str) -> set[str]:
    return {index["name"] for index in inspector.get_indexes(table_name)}


def _foreign_keys(inspector, table_name: str) -> set[str]:
    return {foreign_key["name"] for foreign_key in inspector.get_foreign_keys(table_name) if foreign_key.get("name")}


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if "payment_receipts" not in inspector.get_table_names():
        return

    columns = _columns(inspector, "payment_receipts")
    if "invoice_id" not in columns:
        op.add_column("payment_receipts", sa.Column("invoice_id", sa.Integer(), nullable=True))

    inspector = sa.inspect(conn)
    indexes = _indexes(inspector, "payment_receipts")
    if "ix_payment_receipts_invoice_id" not in indexes:
        op.create_index("ix_payment_receipts_invoice_id", "payment_receipts", ["invoice_id"], unique=False)

    foreign_keys = _foreign_keys(inspector, "payment_receipts")
    if "fk_payment_receipts_invoice_id_invoices" not in foreign_keys:
        op.create_foreign_key(
            "fk_payment_receipts_invoice_id_invoices",
            "payment_receipts",
            "invoices",
            ["invoice_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if "payment_receipts" not in inspector.get_table_names():
        return

    foreign_keys = _foreign_keys(inspector, "payment_receipts")
    if "fk_payment_receipts_invoice_id_invoices" in foreign_keys:
        op.drop_constraint("fk_payment_receipts_invoice_id_invoices", "payment_receipts", type_="foreignkey")

    indexes = _indexes(inspector, "payment_receipts")
    if "ix_payment_receipts_invoice_id" in indexes:
        op.drop_index("ix_payment_receipts_invoice_id", table_name="payment_receipts")

    columns = _columns(inspector, "payment_receipts")
    if "invoice_id" in columns:
        op.drop_column("payment_receipts", "invoice_id")