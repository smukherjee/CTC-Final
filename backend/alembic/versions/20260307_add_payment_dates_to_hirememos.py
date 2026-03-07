"""add payment date columns to hirememos

Revision ID: 20260307_add_paydates
Revises: 20260306_01
Create Date: 2026-03-07 04:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260307_add_paydates'
down_revision = '20260306_01'
branch_labels = None
depends_on = None


def upgrade():
    # add new date columns; nullable to allow existing rows
    op.add_column('hirememos', sa.Column('advance_payment_date', sa.Date(), nullable=True))
    op.add_column('hirememos', sa.Column('balance_payment_date', sa.Date(), nullable=True))


def downgrade():
    op.drop_column('hirememos', 'balance_payment_date')
    op.drop_column('hirememos', 'advance_payment_date')
