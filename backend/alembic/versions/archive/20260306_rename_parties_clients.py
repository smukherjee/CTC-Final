"""rename parties to clients

Revision ID: 20260306_01
Revises: 8ccc3daf3391
Create Date: 2026-03-06 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '20260306_01'
down_revision = '8ccc3daf3391'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    # rename the main master table from parties to clients if it exists
    if conn.dialect.has_table(conn, 'parties'):
        op.rename_table('parties', 'clients')

    # rename FK columns on dependent tables if they exist
    # helpers to check column presence
    def has_column(table_name, column_name):
        inspector = sa.inspect(conn)
        try:
            cols = [c['name'] for c in inspector.get_columns(table_name)]
        except sa.exc.NoSuchTableError:
            return False
        return column_name in cols

    if has_column('invoices', 'party_id'):
        with op.batch_alter_table('invoices', schema=None) as batch_op:
            batch_op.alter_column('party_id', new_column_name='client_id')
    if has_column('contracts', 'party_id'):
        with op.batch_alter_table('contracts', schema=None) as batch_op:
            batch_op.alter_column('party_id', new_column_name='client_id')
    if has_column('lrs', 'fob_party_id'):
        with op.batch_alter_table('lrs', schema=None) as batch_op:
            batch_op.alter_column('fob_party_id', new_column_name='fob_client_id')


def downgrade():
    # reverse changes
    with op.batch_alter_table('lrs', schema=None) as batch_op:
        batch_op.alter_column('fob_client_id', new_column_name='fob_client_id')
    with op.batch_alter_table('contracts', schema=None) as batch_op:
        batch_op.alter_column('client_id', new_column_name='client_id')
    with op.batch_alter_table('invoices', schema=None) as batch_op:
        batch_op.alter_column('client_id', new_column_name='client_id')
    op.rename_table('clients', 'parties')
