"""deprecate and drop lrs.eway_bill JSONB column

The eway_bills table is the authoritative store. lrs.eway_bill (JSONB)
was a legacy field that is now populated in API responses by
_attach_eway_bills() from the eway_bills table — it is no longer
used as a primary source. lrs.eway_bill_no and lrs.eway_bill_expiry
are kept as summary/query fields.

This migration:
1. Copies any JSONB data that has no corresponding eway_bills record
   into the eway_bills table (data rescue).
2. Drops the lrs.eway_bill JSONB column.

The ORM model and service no longer reference this column as of this fix.

Revision ID: 20260315_07
Revises: 20260315_06
Create Date: 2026-03-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260315_07"
down_revision = "20260315_06"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = set(inspector.get_table_names())

    if "lrs" not in tables:
        return

    lrs_cols = {c["name"] for c in inspector.get_columns("lrs")}
    if "eway_bill" not in lrs_cols:
        return  # Already dropped

    # Step 1: rescue any JSONB eway_bill data that has no eway_bills row
    if "eway_bills" in tables:
        op.execute("""
            INSERT INTO eway_bills (lr_id, number, status, created_at)
            SELECT
                l.id,
                COALESCE(
                    l.eway_bill->>'no',
                    l.eway_bill->>'number',
                    l.eway_bill_no,
                    'UNKNOWN'
                ),
                COALESCE(l.eway_bill->>'status', 'ACTIVE'),
                NOW()
            FROM lrs l
            WHERE
                l.eway_bill IS NOT NULL
                AND (l.eway_bill->>'no' IS NOT NULL OR l.eway_bill->>'number' IS NOT NULL OR l.eway_bill_no IS NOT NULL)
                AND NOT EXISTS (
                    SELECT 1 FROM eway_bills eb WHERE eb.lr_id = l.id
                )
        """)

    # Step 2: drop the JSONB column
    op.drop_column("lrs", "eway_bill")


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = set(inspector.get_table_names())
    if "lrs" not in tables:
        return
    lrs_cols = {c["name"] for c in inspector.get_columns("lrs")}
    if "eway_bill" not in lrs_cols:
        op.add_column("lrs", sa.Column(
            "eway_bill",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ))
