"""add pan and rename gst/contact to gstin/mobile

Revision ID: 0002_add_pan_and_rename_columns
Revises: 0001_create_parties_vendors
Create Date: 2026-02-14 07:50:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_add_pan_and_rename_columns'
down_revision = '0001_create_parties_vendors'
branch_labels = None
depends_on = None


def upgrade():
    # Rename columns in parties
    with op.batch_alter_table('parties') as batch_op:
        batch_op.alter_column('gst_no', new_column_name='gstin', existing_type=sa.String(length=64))
        batch_op.alter_column('contact', new_column_name='mobile', existing_type=sa.String(length=64))

    # Rename columns in vendors and add pan
    with op.batch_alter_table('vendors') as batch_op:
        batch_op.alter_column('gst_no', new_column_name='gstin', existing_type=sa.String(length=64))
        batch_op.alter_column('contact', new_column_name='mobile', existing_type=sa.String(length=64))
        batch_op.add_column(sa.Column('pan', sa.String(length=64), nullable=True))


def downgrade():
    # Revert vendors
    with op.batch_alter_table('vendors') as batch_op:
        batch_op.drop_column('pan')
        batch_op.alter_column('mobile', new_column_name='contact', existing_type=sa.String(length=64))
        batch_op.alter_column('gstin', new_column_name='gst_no', existing_type=sa.String(length=64))

    # Revert parties
    with op.batch_alter_table('parties') as batch_op:
        batch_op.alter_column('mobile', new_column_name='contact', existing_type=sa.String(length=64))
        batch_op.alter_column('gstin', new_column_name='gst_no', existing_type=sa.String(length=64))
