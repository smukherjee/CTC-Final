"""drop vendor gstin if exists

Revision ID: 0004_drop_vendor_gstin_if_exists
Revises: 0003_fy_numbering_constraints
Create Date: 2026-03-15
"""

from alembic import op
import sqlalchemy as sa


revision = "0004_drop_vendor_gstin_if_exists"
down_revision = "0003_fy_numbering_constraints"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {c["name"] for c in inspector.get_columns("vendors")}
    if "gstin" in columns:
        op.drop_column("vendors", "gstin")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {c["name"] for c in inspector.get_columns("vendors")}
    if "gstin" not in columns:
        op.add_column("vendors", sa.Column("gstin", sa.String(length=64), nullable=True))
