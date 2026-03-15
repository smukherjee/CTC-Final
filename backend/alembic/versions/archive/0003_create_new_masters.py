"""create vehicles, contracts, users, templates tables

Revision ID: 0003_create_new_masters
Revises: 0002_add_pan_and_rename_columns
Create Date: 2026-02-14 09:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_create_new_masters'
down_revision = '0002_add_pan_and_rename_columns'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'vehicles',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('number', sa.String(length=64), nullable=False),
        sa.Column('type', sa.String(length=128), nullable=True),
        sa.Column('capacity', sa.String(length=64), nullable=True),
        sa.Column('owner_id', sa.Integer, nullable=True),
        sa.Column('status', sa.String(length=32), nullable=True),
    )

    op.create_table(
        'contracts',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('client_id', sa.Integer, nullable=True),
        sa.Column('start_date', sa.Date, nullable=True),
        sa.Column('end_date', sa.Date, nullable=True),
        sa.Column('expiry_alert_days', sa.Integer, nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
    )

    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('role', sa.String(length=64), nullable=False),
        sa.Column('branch_id', sa.String(length=64), nullable=True),
    )

    op.create_table(
        'templates',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('file_url', sa.String(length=1024), nullable=True),
    )


def downgrade():
    op.drop_table('templates')
    op.drop_table('users')
    op.drop_table('contracts')
    op.drop_table('vehicles')
