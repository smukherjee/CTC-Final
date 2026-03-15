"""add lr_deductions table

Revision ID: 0002_add_lr_deductions_table
Revises: 0001_initial_schema
Create Date: 2026-03-15
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_add_lr_deductions_table"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "lr_deductions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("lr_id", sa.Integer(), sa.ForeignKey("lrs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("deduction_label", sa.String(length=128), nullable=False),
        sa.Column("deduction_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_lr_deductions_lr_id", "lr_deductions", ["lr_id"])


def downgrade() -> None:
    op.drop_index("ix_lr_deductions_lr_id", table_name="lr_deductions")
    op.drop_table("lr_deductions")
