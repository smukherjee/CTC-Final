"""add status field to vehicle_locations

Revision ID: 20260220_02
Revises: 20260220_01
Create Date: 2026-02-20 19:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260220_02'
down_revision = '20260220_01'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'vehicle_locations',
        sa.Column('status', sa.String(length=64), nullable=True, server_default='IN_TRANSIT'),
    )


def downgrade():
    op.drop_column('vehicle_locations', 'status')
