"""add bill notebook fields to lrs

Revision ID: 20260220_01
Revises: 8ccc3daf3391
Create Date: 2026-02-20 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260220_01'
down_revision = '8ccc3daf3391'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    lrs_cols = {c['name'] for c in inspector.get_columns('lrs')} if 'lrs' in inspector.get_table_names() else set()

    if 'bill_date' not in lrs_cols:
        op.add_column('lrs', sa.Column('bill_date', sa.Date(), nullable=True))
    if 'amount_passed' not in lrs_cols:
        op.add_column('lrs', sa.Column('amount_passed', sa.Numeric(precision=12, scale=2), nullable=True))
    if 'deductions' not in lrs_cols:
        op.add_column('lrs', sa.Column('deductions', sa.String(length=256), nullable=True))
    if 'cm_no' not in lrs_cols:
        op.add_column('lrs', sa.Column('cm_no', sa.String(length=64), nullable=True))
    if 'cm_date' not in lrs_cols:
        op.add_column('lrs', sa.Column('cm_date', sa.Date(), nullable=True))


def downgrade():
    op.drop_column('lrs', 'cm_date')
    op.drop_column('lrs', 'cm_no')
    op.drop_column('lrs', 'deductions')
    op.drop_column('lrs', 'amount_passed')
    op.drop_column('lrs', 'bill_date')

