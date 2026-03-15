"""add mamul column to hirememos

HireMemoModel declares mamul and hirememo_service._sync_lr_financials()
writes hm.mamul = 0.0 on every create/update. Neither 0004_create_hirememos
nor 20260217_add_missing_fields added the column. Every hire memo
create/update was crashing on a clean deploy.

Revision ID: 20260315_02
Revises: 20260315_01
Create Date: 2026-03-15
"""
from alembic import op
import sqlalchemy as sa

revision = "20260315_02"
down_revision = "20260315_01"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if "hirememos" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("hirememos")}
    if "mamul" not in cols:
        op.add_column("hirememos", sa.Column(
            "mamul", sa.Numeric(12, 2), nullable=True, server_default="0"
        ))


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if "hirememos" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("hirememos")}
    if "mamul" in cols:
        op.drop_column("hirememos", "mamul")
