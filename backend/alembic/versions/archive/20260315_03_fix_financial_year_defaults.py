"""fix hardcoded financial_year server defaults

All six tables had server_default='2025-26'. From April 1 2026 this
would silently miscategorise new rows. This migration creates a
PostgreSQL function current_financial_year() and updates all
server defaults to use it.

Revision ID: 20260315_03
Revises: 20260315_02
Create Date: 2026-03-15
"""
from alembic import op
import sqlalchemy as sa

revision = "20260315_03"
down_revision = "20260315_02"
branch_labels = None
depends_on = None

_TABLES_WITH_FY = [
    "lrs",
    "hirememos",
    "vouchers",
    "invoices",
    "payment_receipts",
    "invoice_lines",
]

_CREATE_FN = """
CREATE OR REPLACE FUNCTION current_financial_year() RETURNS text
LANGUAGE sql STABLE AS $$
    SELECT
        CASE
            WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4
                THEN EXTRACT(YEAR FROM CURRENT_DATE)::int
            ELSE (EXTRACT(YEAR FROM CURRENT_DATE)::int - 1)
        END::text
        || '-' ||
        LPAD(
            (
                CASE
                    WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4
                        THEN (EXTRACT(YEAR FROM CURRENT_DATE)::int + 1) % 100
                    ELSE EXTRACT(YEAR FROM CURRENT_DATE)::int % 100
                END
            )::text,
            2, '0'
        )
$$;
"""

_DROP_FN = "DROP FUNCTION IF EXISTS current_financial_year();"


def upgrade():
    op.execute(_CREATE_FN)

    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = set(inspector.get_table_names())

    for table in _TABLES_WITH_FY:
        if table not in existing_tables:
            continue
        cols = {c["name"] for c in inspector.get_columns(table)}
        if "financial_year" not in cols:
            continue
        op.alter_column(
            table,
            "financial_year",
            server_default=sa.text("current_financial_year()"),
            existing_type=sa.String(7),
            existing_nullable=False,
        )


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = set(inspector.get_table_names())

    for table in _TABLES_WITH_FY:
        if table not in existing_tables:
            continue
        cols = {c["name"] for c in inspector.get_columns(table)}
        if "financial_year" not in cols:
            continue
        op.alter_column(
            table,
            "financial_year",
            server_default=sa.text("'2025-26'"),
            existing_type=sa.String(7),
            existing_nullable=False,
        )

    op.execute(_DROP_FN)
