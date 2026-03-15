"""add missing FK constraints and voucher reference_type check

Adds FK constraints with NOT VALID (enforces on new rows, skips
existing row scan to avoid failing on potentially orphaned data).
Also adds a CHECK constraint on vouchers.reference_type.

Revision ID: 20260315_04
Revises: 20260315_03
Create Date: 2026-03-15
"""
from alembic import op
import sqlalchemy as sa

revision = "20260315_04"
down_revision = "20260315_03"
branch_labels = None
depends_on = None


def _add_fk_not_valid(table, col, ref_table, ref_col, name):
    """Add a FK constraint without validating existing rows (PostgreSQL only)."""
    op.execute(
        f"ALTER TABLE {table} ADD CONSTRAINT {name} "
        f"FOREIGN KEY ({col}) REFERENCES {ref_table} ({ref_col}) NOT VALID"
    )


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = set(inspector.get_table_names())

    def existing_fks(table):
        if table not in existing_tables:
            return set()
        return {fk["name"] for fk in inspector.get_foreign_keys(table)}

    def existing_cols(table):
        if table not in existing_tables:
            return set()
        return {c["name"] for c in inspector.get_columns(table)}

    # lrs.vehicle_id → vehicles.id
    if "lrs" in existing_tables and "fk_lrs_vehicle_id" not in existing_fks("lrs"):
        if "vehicle_id" in existing_cols("lrs") and "vehicles" in existing_tables:
            _add_fk_not_valid("lrs", "vehicle_id", "vehicles", "id", "fk_lrs_vehicle_id")

    # lrs.fob_client_id → clients.id
    if "lrs" in existing_tables and "fk_lrs_fob_client_id" not in existing_fks("lrs"):
        if "fob_client_id" in existing_cols("lrs") and "clients" in existing_tables:
            _add_fk_not_valid("lrs", "fob_client_id", "clients", "id", "fk_lrs_fob_client_id")

    # lrs.through_id → vendors.id
    if "lrs" in existing_tables and "fk_lrs_through_id" not in existing_fks("lrs"):
        if "through_id" in existing_cols("lrs") and "vendors" in existing_tables:
            _add_fk_not_valid("lrs", "through_id", "vendors", "id", "fk_lrs_through_id")

    # lrs.pod_file_id → file_uploads.id
    if "lrs" in existing_tables and "fk_lrs_pod_file_id" not in existing_fks("lrs"):
        if "pod_file_id" in existing_cols("lrs") and "file_uploads" in existing_tables:
            _add_fk_not_valid("lrs", "pod_file_id", "file_uploads", "id", "fk_lrs_pod_file_id")

    # hirememos.lr_id → lrs.id
    if "hirememos" in existing_tables and "fk_hirememos_lr_id" not in existing_fks("hirememos"):
        if "lr_id" in existing_cols("hirememos") and "lrs" in existing_tables:
            _add_fk_not_valid("hirememos", "lr_id", "lrs", "id", "fk_hirememos_lr_id")

    # hirememos.vehicle_id → vehicles.id
    if "hirememos" in existing_tables and "fk_hirememos_vehicle_id" not in existing_fks("hirememos"):
        if "vehicle_id" in existing_cols("hirememos") and "vehicles" in existing_tables:
            _add_fk_not_valid("hirememos", "vehicle_id", "vehicles", "id", "fk_hirememos_vehicle_id")

    # eway_bills.lr_id → lrs.id
    if "eway_bills" in existing_tables and "fk_eway_bills_lr_id" not in existing_fks("eway_bills"):
        if "lr_id" in existing_cols("eway_bills") and "lrs" in existing_tables:
            _add_fk_not_valid("eway_bills", "lr_id", "lrs", "id", "fk_eway_bills_lr_id")

    # file_uploads.lr_id → lrs.id
    if "file_uploads" in existing_tables and "fk_file_uploads_lr_id" not in existing_fks("file_uploads"):
        if "lr_id" in existing_cols("file_uploads") and "lrs" in existing_tables:
            _add_fk_not_valid("file_uploads", "lr_id", "lrs", "id", "fk_file_uploads_lr_id")

    # file_uploads.hirememo_id → hirememos.id
    if "file_uploads" in existing_tables and "fk_file_uploads_hirememo_id" not in existing_fks("file_uploads"):
        if "hirememo_id" in existing_cols("file_uploads") and "hirememos" in existing_tables:
            _add_fk_not_valid("file_uploads", "hirememo_id", "hirememos", "id", "fk_file_uploads_hirememo_id")

    # invoices.client_id → clients.id
    if "invoices" in existing_tables and "fk_invoices_client_id" not in existing_fks("invoices"):
        if "client_id" in existing_cols("invoices") and "clients" in existing_tables:
            _add_fk_not_valid("invoices", "client_id", "clients", "id", "fk_invoices_client_id")

    # contracts.client_id → clients.id
    if "contracts" in existing_tables and "fk_contracts_client_id" not in existing_fks("contracts"):
        if "client_id" in existing_cols("contracts") and "clients" in existing_tables:
            _add_fk_not_valid("contracts", "client_id", "clients", "id", "fk_contracts_client_id")

    # vehicles.owner_id → vendors.id
    if "vehicles" in existing_tables and "fk_vehicles_owner_id" not in existing_fks("vehicles"):
        if "owner_id" in existing_cols("vehicles") and "vendors" in existing_tables:
            _add_fk_not_valid("vehicles", "owner_id", "vendors", "id", "fk_vehicles_owner_id")

    # payment_receipts.received_from_id → clients.id
    if "payment_receipts" in existing_tables and "fk_payment_receipts_received_from_id" not in existing_fks("payment_receipts"):
        if "received_from_id" in existing_cols("payment_receipts") and "clients" in existing_tables:
            _add_fk_not_valid("payment_receipts", "received_from_id", "clients", "id", "fk_payment_receipts_received_from_id")

    # payment_receipts.invoice_id → invoices.id
    if "payment_receipts" in existing_tables and "fk_payment_receipts_invoice_id" not in existing_fks("payment_receipts"):
        if "invoice_id" in existing_cols("payment_receipts") and "invoices" in existing_tables:
            _add_fk_not_valid("payment_receipts", "invoice_id", "invoices", "id", "fk_payment_receipts_invoice_id")

    # vouchers: add CHECK constraint on reference_type
    if "vouchers" in existing_tables:
        existing_checks = {c["name"] for c in inspector.get_check_constraints("vouchers")}
        if "ck_vouchers_reference_type" not in existing_checks:
            op.create_check_constraint(
                "ck_vouchers_reference_type",
                "vouchers",
                "reference_type IN ('LR', 'HIREMEMO', 'INVOICE', 'PAYMENT', 'GENERAL') OR reference_type IS NULL",
            )


def downgrade():
    fk_names = [
        ("lrs", "fk_lrs_vehicle_id"),
        ("lrs", "fk_lrs_fob_client_id"),
        ("lrs", "fk_lrs_through_id"),
        ("lrs", "fk_lrs_pod_file_id"),
        ("hirememos", "fk_hirememos_lr_id"),
        ("hirememos", "fk_hirememos_vehicle_id"),
        ("eway_bills", "fk_eway_bills_lr_id"),
        ("file_uploads", "fk_file_uploads_lr_id"),
        ("file_uploads", "fk_file_uploads_hirememo_id"),
        ("invoices", "fk_invoices_client_id"),
        ("contracts", "fk_contracts_client_id"),
        ("vehicles", "fk_vehicles_owner_id"),
        ("payment_receipts", "fk_payment_receipts_received_from_id"),
        ("payment_receipts", "fk_payment_receipts_invoice_id"),
    ]
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = set(inspector.get_table_names())
    for table, name in fk_names:
        if table not in existing_tables:
            continue
        fks = {fk["name"] for fk in inspector.get_foreign_keys(table)}
        if name in fks:
            op.drop_constraint(name, table, type_="foreignkey")

    if "vouchers" in existing_tables:
        checks = {c["name"] for c in inspector.get_check_constraints("vouchers")}
        if "ck_vouchers_reference_type" in checks:
            op.drop_constraint("ck_vouchers_reference_type", "vouchers", type_="check")
