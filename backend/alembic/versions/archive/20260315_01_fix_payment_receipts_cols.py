"""fix payment_receipts missing columns

Migration 20260305_08 created the table with only 7 columns.
The ORM model and service expect 14 columns. Every INSERT was
crashing on a clean deploy. This migration adds the 8 missing columns.

Revision ID: 20260315_01
Revises: 20260305_09
Create Date: 2026-03-15
"""
from alembic import op
import sqlalchemy as sa

revision = "20260315_01"
down_revision = "20260305_09"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if "payment_receipts" not in inspector.get_table_names():
        # Table doesn't exist at all — create it in full
        op.create_table(
            "payment_receipts",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("payment_date", sa.Date(), nullable=False),
            sa.Column("amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
            sa.Column("invoice_id", sa.Integer(), nullable=True),
            sa.Column("received_from_id", sa.Integer(), nullable=True),
            sa.Column("received_from", sa.String(length=256), nullable=False, server_default=""),
            sa.Column("total_billed_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
            sa.Column("tds_deducted", sa.Numeric(12, 2), nullable=False, server_default="0"),
            sa.Column("net_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
            sa.Column("other_deduction", sa.Numeric(12, 2), nullable=False, server_default="0"),
            sa.Column("deduction_remarks", sa.Text(), nullable=True),
            sa.Column("payment_mode", sa.String(length=32), nullable=False, server_default="BANK"),
            sa.Column("financial_year", sa.String(length=7), nullable=False, server_default="2025-26"),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        )
        op.create_index("ix_payment_receipts_id", "payment_receipts", ["id"], unique=False)
        return

    cols = {c["name"] for c in inspector.get_columns("payment_receipts")}

    if "invoice_id" not in cols:
        op.add_column("payment_receipts", sa.Column("invoice_id", sa.Integer(), nullable=True))
        op.create_index("ix_payment_receipts_invoice_id", "payment_receipts", ["invoice_id"])

    if "received_from_id" not in cols:
        op.add_column("payment_receipts", sa.Column("received_from_id", sa.Integer(), nullable=True))
        op.create_index("ix_payment_receipts_received_from_id", "payment_receipts", ["received_from_id"])

    if "received_from" not in cols:
        # Add nullable first, backfill empty string, then set server_default
        op.add_column("payment_receipts", sa.Column("received_from", sa.String(length=256), nullable=True))
        op.execute("UPDATE payment_receipts SET received_from = '' WHERE received_from IS NULL")
        op.alter_column("payment_receipts", "received_from", nullable=False, server_default="")

    if "total_billed_amount" not in cols:
        # Backfill from amount if it exists
        op.add_column("payment_receipts", sa.Column(
            "total_billed_amount", sa.Numeric(12, 2), nullable=False, server_default="0"
        ))
        if "amount" in cols:
            op.execute("UPDATE payment_receipts SET total_billed_amount = amount WHERE total_billed_amount = 0")

    if "tds_deducted" not in cols:
        op.add_column("payment_receipts", sa.Column(
            "tds_deducted", sa.Numeric(12, 2), nullable=False, server_default="0"
        ))

    if "net_amount" not in cols:
        op.add_column("payment_receipts", sa.Column(
            "net_amount", sa.Numeric(12, 2), nullable=False, server_default="0"
        ))
        # Backfill net_amount from amount (legacy field) or total_billed_amount
        op.execute("""
            UPDATE payment_receipts
            SET net_amount = COALESCE(amount, total_billed_amount, 0)
            WHERE net_amount = 0
        """)

    if "other_deduction" not in cols:
        op.add_column("payment_receipts", sa.Column(
            "other_deduction", sa.Numeric(12, 2), nullable=False, server_default="0"
        ))

    if "deduction_remarks" not in cols:
        op.add_column("payment_receipts", sa.Column("deduction_remarks", sa.Text(), nullable=True))

    if "payment_mode" not in cols:
        op.add_column("payment_receipts", sa.Column(
            "payment_mode", sa.String(length=32), nullable=False, server_default="BANK"
        ))


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if "payment_receipts" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("payment_receipts")}
    for col in ("payment_mode", "deduction_remarks", "other_deduction",
                "net_amount", "tds_deducted", "total_billed_amount",
                "received_from_id", "invoice_id"):
        if col in cols:
            try:
                if col in ("invoice_id", "received_from_id"):
                    op.drop_index(f"ix_payment_receipts_{col}", table_name="payment_receipts")
            except Exception:
                pass
            op.drop_column("payment_receipts", col)
