"""add created_at/updated_at to tables missing timestamps

contracts, vehicles, users, vendors, cities, templates all had no
audit timestamps. Also fixes lrs.created_at to have server_default
and lrs.updated_at to trigger on update.

Revision ID: 20260315_06
Revises: 20260315_05
Create Date: 2026-03-15
"""
from alembic import op
import sqlalchemy as sa

revision = "20260315_06"
down_revision = "20260315_05"
branch_labels = None
depends_on = None

_TABLES = ["contracts", "vehicles", "users", "vendors", "cities", "templates"]


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = set(inspector.get_table_names())

    for table in _TABLES:
        if table not in existing_tables:
            continue
        cols = {c["name"] for c in inspector.get_columns(table)}
        if "created_at" not in cols:
            op.add_column(table, sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=True,
            ))
        if "updated_at" not in cols:
            op.add_column(table, sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=True,
            ))

    # Fix lrs.created_at — was nullable with no server_default
    if "lrs" in existing_tables:
        op.alter_column(
            "lrs", "created_at",
            server_default=sa.func.now(),
            existing_type=sa.DateTime(timezone=True),
            existing_nullable=True,
        )
        # updated_at already exists; ensure it is nullable (no change needed)


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = set(inspector.get_table_names())

    for table in _TABLES:
        if table not in existing_tables:
            continue
        cols = {c["name"] for c in inspector.get_columns(table)}
        for col in ("updated_at", "created_at"):
            if col in cols:
                op.drop_column(table, col)

    if "lrs" in existing_tables:
        op.alter_column(
            "lrs", "created_at",
            server_default=None,
            existing_type=sa.DateTime(timezone=True),
            existing_nullable=True,
        )
