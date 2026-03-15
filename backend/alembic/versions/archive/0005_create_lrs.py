"""create lrs table

Revision ID: 0005_create_lrs
Revises: 0004_create_hirememos
Create Date: 2026-02-16 04:30:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0005_create_lrs'
down_revision = '0004_create_hirememos'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'lrs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('lr_number', sa.String(length=64), nullable=False, unique=True),
        sa.Column('date', sa.Date, nullable=True),
        sa.Column('consignor_id', sa.String(length=64), nullable=True),
        sa.Column('consignor_name', sa.String(length=256), nullable=True),
        sa.Column('consignee_id', sa.String(length=64), nullable=True),
        sa.Column('consignee_name', sa.String(length=256), nullable=True),
        sa.Column('origin', sa.String(length=128), nullable=True),
        sa.Column('destination', sa.String(length=128), nullable=True),
        sa.Column('delivery_at', sa.String(length=256), nullable=True),
        sa.Column('through_id', sa.Integer, nullable=True),
        sa.Column('through', sa.String(length=256), nullable=True),
        sa.Column('fob', sa.String(length=128), nullable=True),
        sa.Column('goods_items', sa.JSON(), nullable=True),
        sa.Column('articles_count', sa.Integer, nullable=True),
        sa.Column('articles_description', sa.Text(), nullable=True),
        sa.Column('weight', sa.Numeric(12, 2), nullable=True),
        sa.Column('freight_amount', sa.Numeric(12, 2), nullable=True),
        sa.Column('status', sa.String(length=64), nullable=False, server_default='DRAFT'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_table('lrs')
