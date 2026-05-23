"""add financial_year to lrs

Revision ID: 20260305_01
Revises: 20260221_02
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20260305_01'
down_revision = '20260221_02'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('lrs', sa.Column(
        'financial_year', sa.String(7), nullable=False, server_default='2025-26'
    ))
    op.add_column('lrs', sa.Column('fob_client_id', sa.Integer(), nullable=True))
    op.add_column('lrs', sa.Column('pod_received', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('lrs', sa.Column('pod_file_id', sa.Integer(), nullable=True))
    op.add_column('lrs', sa.Column('eway_bill_no', sa.String(64), nullable=True))
    op.add_column('lrs', sa.Column('eway_bill_expiry', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    op.drop_column('lrs', 'eway_bill_expiry')
    op.drop_column('lrs', 'eway_bill_no')
    op.drop_column('lrs', 'pod_file_id')
    op.drop_column('lrs', 'pod_received')
    op.drop_column('lrs', 'fob_client_id')
    op.drop_column('lrs', 'financial_year')
