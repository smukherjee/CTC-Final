"""Merge migration: join the 20260307 main chain with the 20260315 fix chain.

The 20260315 fix series (01-08) branched from 20260305_09 (create_vouchers)
instead of from 20260307_03 (the tip of the main chain at that point).
This migration re-joins the two heads into a single linear chain so that
`alembic upgrade head` works without ambiguity.

No schema changes — this is a pointer-only merge.

Revision ID: 20260315_09
Revises: 20260307_03, 20260315_08
Create Date: 2026-03-15
"""

revision = "20260315_09"
down_revision = ("20260307_03", "20260315_08")
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
