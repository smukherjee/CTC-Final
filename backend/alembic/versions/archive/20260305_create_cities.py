"""create cities table

Revision ID: 20260305_11
Revises: 20260305_10
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "20260305_11"
down_revision = "20260305_10"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "cities" not in tables:
        op.create_table(
            "cities",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("name", sa.String(length=256), nullable=False),
            sa.Column("state", sa.String(length=128), nullable=True),
            sa.Column("code", sa.String(length=32), nullable=True),
        )

    inspector = sa.inspect(conn)
    indexes = {idx["name"] for idx in inspector.get_indexes("cities")}
    if "ix_cities_name" not in indexes:
        op.create_index("ix_cities_name", "cities", ["name"], unique=False)


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if "cities" not in tables:
        return

    try:
        op.drop_index("ix_cities_name", table_name="cities")
    except Exception:
        pass
    op.drop_table("cities")
