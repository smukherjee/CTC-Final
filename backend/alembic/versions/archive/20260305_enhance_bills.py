"""enhance bills table with FY and financial columns

Revision ID: 20260305_03
Revises: 20260305_02
Create Date: 2026-03-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20260305_03'
down_revision = '20260305_02'
branch_labels = None
depends_on = None


def upgrade():
    # Check if bills table exists before altering
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if 'bills' not in tables:
        return  # bills table not yet created, skip

    existing_cols = {c['name'] for c in inspector.get_columns('bills')}

    if 'financial_year' not in existing_cols:
        op.add_column('bills', sa.Column(
            'financial_year', sa.String(7), nullable=False, server_default='2025-26'
        ))
    if 'tds_amount' not in existing_cols:
        op.add_column('bills', sa.Column('tds_amount', sa.Numeric(12, 2), nullable=True))
    if 'net_amount' not in existing_cols:
        op.add_column('bills', sa.Column('net_amount', sa.Numeric(12, 2), nullable=True))
    if 'lr_date' not in existing_cols:
        op.add_column('bills', sa.Column('lr_date', sa.Date(), nullable=True))
    if 'origin' not in existing_cols:
        op.add_column('bills', sa.Column('origin', sa.String(100), nullable=True))
    if 'destination' not in existing_cols:
        op.add_column('bills', sa.Column('destination', sa.String(100), nullable=True))


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if 'bills' not in tables:
        return

    for col in ['destination', 'origin', 'lr_date', 'net_amount', 'tds_amount', 'financial_year']:
        try:
            op.drop_column('bills', col)
        except Exception:
            pass
