"""create parties and vendors tables

Revision ID: 0001_create_parties_vendors
Revises: 
Create Date: 2026-02-14 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_create_parties_vendors'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'parties',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('type', sa.String(length=64), nullable=False),
        sa.Column('gst_no', sa.String(length=64), nullable=True),
        sa.Column('contact', sa.String(length=64), nullable=True),
        sa.Column('address', sa.Text, nullable=True),
    )

    op.create_table(
        'vendors',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('type', sa.String(length=64), nullable=False),
        sa.Column('gst_no', sa.String(length=64), nullable=True),
        sa.Column('contact', sa.String(length=64), nullable=True),
        sa.Column('address', sa.Text, nullable=True),
        sa.Column('tds_certificate_url', sa.String(length=1024), nullable=True),
    )


def downgrade():
    op.drop_table('vendors')
    op.drop_table('parties')
