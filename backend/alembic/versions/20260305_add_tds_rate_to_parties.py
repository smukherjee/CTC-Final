"""add tds_rate to clients

Revision ID: 20260305_05
Revises: 20260305_04
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20260305_05'
down_revision = '20260305_04'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('clients', sa.Column(
        'tds_rate', sa.Numeric(5, 2), nullable=False, server_default='0'
    ))


def downgrade():
    op.drop_column('clients', 'tds_rate')
