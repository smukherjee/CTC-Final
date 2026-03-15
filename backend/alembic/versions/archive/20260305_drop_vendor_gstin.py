"""drop gstin column from vendors

Revision ID: 20260305_04
Revises: 20260305_03
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20260305_04'
down_revision = '20260305_03'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_cols = {c['name'] for c in inspector.get_columns('vendors')}
    if 'gstin' in existing_cols:
        op.drop_column('vendors', 'gstin')


def downgrade():
    op.add_column('vendors', sa.Column('gstin', sa.String(64), nullable=True))
