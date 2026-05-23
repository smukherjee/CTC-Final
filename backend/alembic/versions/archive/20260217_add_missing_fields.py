"""add missing lr and hirememo fields

Revision ID: 20260217_01
Revises: 0005_create_lrs
Create Date: 2026-02-17 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260217_01'
down_revision = '0005_create_lrs'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    # --- LRS TABLE ---
    lrs_cols = {c['name'] for c in inspector.get_columns('lrs')} if 'lrs' in inspector.get_table_names() else set()

    # Vehicle Details
    if 'vehicle_id' not in lrs_cols:
        op.add_column('lrs', sa.Column('vehicle_id', sa.Integer(), nullable=True))
    if 'vehicle_number' not in lrs_cols:
        op.add_column('lrs', sa.Column('vehicle_number', sa.String(length=32), nullable=True))
    if 'vehicle_type' not in lrs_cols:
        op.add_column('lrs', sa.Column('vehicle_type', sa.String(length=64), nullable=True))
    if 'seal_number' not in lrs_cols:
        op.add_column('lrs', sa.Column('seal_number', sa.String(length=64), nullable=True))
    if 'driver_name' not in lrs_cols:
        op.add_column('lrs', sa.Column('driver_name', sa.String(length=128), nullable=True))
    if 'driver_mobile' not in lrs_cols:
        op.add_column('lrs', sa.Column('driver_mobile', sa.String(length=32), nullable=True))

    # Risk & Logistics
    if 'booked_on_owners_risk' not in lrs_cols:
        op.add_column('lrs', sa.Column('booked_on_owners_risk', sa.Boolean(), nullable=True, server_default='false'))
    if 'loading_point_times' not in lrs_cols:
        op.add_column('lrs', sa.Column('loading_point_times', postgresql.JSONB(astext_type=sa.Text()), nullable=True))

    # Financials
    if 'value_rs' not in lrs_cols:
        op.add_column('lrs', sa.Column('value_rs', sa.Numeric(precision=12, scale=2), nullable=True))
    if 'surcharge' not in lrs_cols:
        op.add_column('lrs', sa.Column('surcharge', sa.Numeric(precision=12, scale=2), nullable=True))
    if 'hamali_charges' not in lrs_cols:
        op.add_column('lrs', sa.Column('hamali_charges', sa.Numeric(precision=12, scale=2), nullable=True))
    if 'st_charges' not in lrs_cols:
        op.add_column('lrs', sa.Column('st_charges', sa.Numeric(precision=12, scale=2), nullable=True))
    if 'total' not in lrs_cols:
        op.add_column('lrs', sa.Column('total', sa.Numeric(precision=12, scale=2), nullable=True))

    # Dispatch Register
    if 'bill_number' not in lrs_cols:
        op.add_column('lrs', sa.Column('bill_number', sa.String(length=64), nullable=True))
    if 'remarks' not in lrs_cols:
        op.add_column('lrs', sa.Column('remarks', sa.Text(), nullable=True))
    if 'eway_bill' not in lrs_cols:
        op.add_column('lrs', sa.Column('eway_bill', postgresql.JSONB(astext_type=sa.Text()), nullable=True))

    # --- HIREMEMOS TABLE ---
    hire_cols = {c['name'] for c in inspector.get_columns('hirememos')} if 'hirememos' in inspector.get_table_names() else set()

    # Driver
    if 'driver_name' not in hire_cols:
        op.add_column('hirememos', sa.Column('driver_name', sa.String(length=128), nullable=True))
    if 'driver_mobile' not in hire_cols:
        op.add_column('hirememos', sa.Column('driver_mobile', sa.String(length=32), nullable=True))
    if 'driver_license' not in hire_cols:
        op.add_column('hirememos', sa.Column('driver_license', sa.String(length=64), nullable=True))

    # Meta
    if 'hire_memo_no' not in hire_cols:
        op.add_column('hirememos', sa.Column('hire_memo_no', sa.String(length=64), nullable=True))
    if 'hire_memo_date' not in hire_cols:
        op.add_column('hirememos', sa.Column('hire_memo_date', sa.Date(), nullable=True))
    if 'branch' not in hire_cols:
        op.add_column('hirememos', sa.Column('branch', sa.String(length=64), nullable=True))

    # Vehicle
    if 'vehicle_number' not in hire_cols:
        op.add_column('hirememos', sa.Column('vehicle_number', sa.String(length=32), nullable=True))

    # Route
    if 'from_location' not in hire_cols:
        op.add_column('hirememos', sa.Column('from_location', sa.String(length=128), nullable=True))
    if 'to_location' not in hire_cols:
        op.add_column('hirememos', sa.Column('to_location', sa.String(length=128), nullable=True))
    if 'payment_location' not in hire_cols:
        op.add_column('hirememos', sa.Column('payment_location', sa.String(length=128), nullable=True))

    # Financials
    if 'rate_type' not in hire_cols:
        op.add_column('hirememos', sa.Column('rate_type', sa.String(length=32), nullable=True))
    if 'freight_rate' not in hire_cols:
        op.add_column('hirememos', sa.Column('freight_rate', sa.Numeric(precision=12, scale=2), nullable=True))
    if 'freight_weight' not in hire_cols:
        op.add_column('hirememos', sa.Column('freight_weight', sa.Numeric(precision=12, scale=2), nullable=True))
    if 'guaranteed_weight' not in hire_cols:
        op.add_column('hirememos', sa.Column('guaranteed_weight', sa.Numeric(precision=12, scale=2), nullable=True))

    # Deductions
    if 'commission' not in hire_cols:
        op.add_column('hirememos', sa.Column('commission', sa.Numeric(precision=12, scale=2), nullable=True, server_default='0'))
    if 'hamali' not in hire_cols:
        op.add_column('hirememos', sa.Column('hamali', sa.Numeric(precision=12, scale=2), nullable=True, server_default='0'))
    if 'mamul' not in hire_cols:
        op.add_column('hirememos', sa.Column('mamul', sa.Numeric(precision=12, scale=2), nullable=True, server_default='0'))
    if 'other_deductions' not in hire_cols:
        op.add_column('hirememos', sa.Column('other_deductions', sa.Numeric(precision=12, scale=2), nullable=True, server_default='0'))

    if 'ack_status' not in hire_cols:
        op.add_column('hirememos', sa.Column('ack_status', sa.String(length=32), nullable=False, server_default='PENDING'))


def downgrade():
    # --- HIREMEMOS TABLE ---
    op.drop_column('hirememos', 'ack_status')
    op.drop_column('hirememos', 'other_deductions')
    op.drop_column('hirememos', 'mamul')
    op.drop_column('hirememos', 'hamali')
    op.drop_column('hirememos', 'commission')
    op.drop_column('hirememos', 'guaranteed_weight')
    op.drop_column('hirememos', 'freight_weight')
    op.drop_column('hirememos', 'freight_rate')
    op.drop_column('hirememos', 'rate_type')
    op.drop_column('hirememos', 'payment_location')
    op.drop_column('hirememos', 'to_location')
    op.drop_column('hirememos', 'from_location')
    op.drop_column('hirememos', 'vehicle_number')
    # vehicle_id existed
    op.drop_column('hirememos', 'branch')
    op.drop_column('hirememos', 'hire_memo_date')
    op.drop_column('hirememos', 'hire_memo_no')
    op.drop_column('hirememos', 'driver_license')
    op.drop_column('hirememos', 'driver_mobile')
    op.drop_column('hirememos', 'driver_name')

    # --- LRS TABLE ---
    op.drop_column('lrs', 'eway_bill')
    op.drop_column('lrs', 'remarks')
    op.drop_column('lrs', 'bill_number')
    op.drop_column('lrs', 'total')
    op.drop_column('lrs', 'st_charges')
    op.drop_column('lrs', 'hamali_charges')
    op.drop_column('lrs', 'surcharge')
    op.drop_column('lrs', 'value_rs')
    op.drop_column('lrs', 'loading_point_times')
    op.drop_column('lrs', 'booked_on_owners_risk')
    op.drop_column('lrs', 'driver_mobile')
    op.drop_column('lrs', 'driver_name')
    op.drop_column('lrs', 'seal_number')
    op.drop_column('lrs', 'vehicle_type')
    op.drop_column('lrs', 'vehicle_number')
    op.drop_column('lrs', 'vehicle_id')
