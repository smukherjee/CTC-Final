"""create hirememos table

Revision ID: 0004_create_hirememos
Revises: 0003_create_new_masters
Create Date: 2026-02-16 03:45:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004_create_hirememos'
down_revision = '0003_create_new_masters'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'hirememos',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('lr_id', sa.Integer, nullable=False),
        sa.Column('total_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('advance_cash', sa.Numeric(12, 2), nullable=True),
        sa.Column('advance_bank', sa.Numeric(12, 2), nullable=True),
        sa.Column('balance', sa.Numeric(12, 2), nullable=True),
        sa.Column('driver_name', sa.String(length=128), nullable=True),
        sa.Column('driver_mobile', sa.String(length=32), nullable=True),
        sa.Column('vehicle_id', sa.Integer, nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_table('hirememos')
