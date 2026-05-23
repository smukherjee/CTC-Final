"""add financial_year to hirememos

Revision ID: 20260305_02
Revises: 20260305_01
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20260305_02'
down_revision = '20260305_01'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('hirememos', sa.Column(
        'financial_year', sa.String(7), nullable=False, server_default='2025-26'
    ))
    # Add unique constraint on (hire_memo_no, financial_year)
    op.create_unique_constraint(
        'uq_hirememos_no_fy',
        'hirememos',
        ['hire_memo_no', 'financial_year']
    )


def downgrade():
    op.drop_constraint('uq_hirememos_no_fy', 'hirememos', type_='unique')
    op.drop_column('hirememos', 'financial_year')
