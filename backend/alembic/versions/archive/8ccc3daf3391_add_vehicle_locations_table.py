"""add_vehicle_locations_table

Revision ID: 8ccc3daf3391
Revises: 20260217_01
Create Date: 2026-02-17 13:14:45.810796

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8ccc3daf3391'
down_revision = '20260217_01'
branch_labels = None
depends_on = None



def upgrade():
    # Create vehicle_locations table
    op.create_table(
        'vehicle_locations',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('lr_id', sa.Integer, nullable=True),
        sa.Column('vehicle_number', sa.String, nullable=False),
        sa.Column('location', sa.String, nullable=False),
        sa.Column('reported_by', sa.String, nullable=True),
        sa.Column('reported_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_vehicle_locations_lr_id',
        'vehicle_locations', 'lrs',
        ['lr_id'], ['id'],
        ondelete='SET NULL'
    )
    
    # Create indexes for performance
    op.create_index('idx_vehicle_locations_vehicle_number', 'vehicle_locations', ['vehicle_number'])
    op.create_index('idx_vehicle_locations_lr_id', 'vehicle_locations', ['lr_id'])
    op.create_index('idx_vehicle_locations_reported_at', 'vehicle_locations', ['reported_at'], postgresql_using='btree', postgresql_ops={'reported_at': 'DESC'})


def downgrade():
    # Drop indexes
    op.drop_index('idx_vehicle_locations_reported_at', table_name='vehicle_locations')
    op.drop_index('idx_vehicle_locations_lr_id', table_name='vehicle_locations')
    op.drop_index('idx_vehicle_locations_vehicle_number', table_name='vehicle_locations')
    
    # Drop foreign key
    op.drop_constraint('fk_vehicle_locations_lr_id', 'vehicle_locations', type_='foreignkey')
    
    # Drop table
    op.drop_table('vehicle_locations')

