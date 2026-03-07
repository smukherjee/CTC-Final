"""enhance payment receipts register

Revision ID: 20260307_02
Revises: 8da119876ee6
Create Date: 2026-03-07 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "20260307_02"
down_revision = "8da119876ee6"
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
    tables = inspector.get_table_names()
    if "payment_receipts" not in tables:
        return

    columns = _columns(inspector, "payment_receipts")

    if "received_from_id" not in columns:
        op.add_column("payment_receipts", sa.Column("received_from_id", sa.Integer(), nullable=True))
    if "total_billed_amount" not in columns:
        op.add_column(
            "payment_receipts",
            sa.Column("total_billed_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        )
    if "tds_deducted" not in columns:
        op.add_column(
            "payment_receipts",
            sa.Column("tds_deducted", sa.Numeric(12, 2), nullable=False, server_default="0"),
        )
    if "net_amount" not in columns:
        op.add_column(
            "payment_receipts",
            sa.Column("net_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        )
    if "other_deduction" not in columns:
        op.add_column(
            "payment_receipts",
            sa.Column("other_deduction", sa.Numeric(12, 2), nullable=False, server_default="0"),
        )
    if "deduction_remarks" not in columns:
        op.add_column("payment_receipts", sa.Column("deduction_remarks", sa.Text(), nullable=True))
    if "payment_mode" not in columns:
        op.add_column(
            "payment_receipts",
            sa.Column("payment_mode", sa.String(length=32), nullable=False, server_default="BANK"),
        )

    op.execute(
        sa.text(
            """
            UPDATE payment_receipts
            SET total_billed_amount = COALESCE(total_billed_amount, amount, 0),
                tds_deducted = COALESCE(tds_deducted, 0),
                other_deduction = COALESCE(other_deduction, 0),
                net_amount = COALESCE(net_amount, amount, 0),
                deduction_remarks = COALESCE(deduction_remarks, notes),
                payment_mode = COALESCE(NULLIF(payment_mode, ''), 'BANK')
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE payment_receipts pr
            SET received_from_id = c.id
            FROM clients c
            WHERE pr.received_from_id IS NULL
              AND c.name = pr.received_from
            """
        )
    )

    inspector = sa.inspect(conn)
    indexes = _indexes(inspector, "payment_receipts")
    if "ix_payment_receipts_received_from_id" not in indexes:
        op.create_index("ix_payment_receipts_received_from_id", "payment_receipts", ["received_from_id"], unique=False)

    foreign_keys = _foreign_keys(inspector, "payment_receipts")
    if "fk_payment_receipts_received_from_id_clients" not in foreign_keys:
        op.create_foreign_key(
            "fk_payment_receipts_received_from_id_clients",
            "payment_receipts",
            "clients",
            ["received_from_id"],
            ["id"],
        )

    op.alter_column("payment_receipts", "total_billed_amount", server_default=None)
    op.alter_column("payment_receipts", "tds_deducted", server_default=None)
    op.alter_column("payment_receipts", "net_amount", server_default=None)
    op.alter_column("payment_receipts", "other_deduction", server_default=None)
    op.alter_column("payment_receipts", "payment_mode", server_default=None)


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "payment_receipts" not in tables:
        return

    indexes = _indexes(inspector, "payment_receipts")
    if "ix_payment_receipts_received_from_id" in indexes:
        op.drop_index("ix_payment_receipts_received_from_id", table_name="payment_receipts")

    foreign_keys = _foreign_keys(inspector, "payment_receipts")
    if "fk_payment_receipts_received_from_id_clients" in foreign_keys:
        op.drop_constraint("fk_payment_receipts_received_from_id_clients", "payment_receipts", type_="foreignkey")

    columns = _columns(inspector, "payment_receipts")
    for column_name in [
        "payment_mode",
        "deduction_remarks",
        "other_deduction",
        "net_amount",
        "tds_deducted",
        "total_billed_amount",
        "received_from_id",
    ]:
        if column_name in columns:
            op.drop_column("payment_receipts", column_name)
