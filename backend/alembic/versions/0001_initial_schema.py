"""Initial consolidated schema — single head migration.

All previous incremental migrations have been archived to
alembic/versions/archive/.  This is now the only migration;
down_revision = None.

Revision ID: 0001_initial_schema
Revises: (none)
Create Date: 2026-03-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── 1. users ─────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("role", sa.String(64), nullable=False),
        sa.Column("branch_id", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # ── 2. clients ───────────────────────────────────────────────────────────
    op.create_table(
        "clients",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("gstin", sa.String(64), nullable=True),
        sa.Column("mobile", sa.String(64), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("tds_rate", sa.Numeric(5, 2), nullable=False, server_default="0"),
    )

    # ── 3. vendors ───────────────────────────────────────────────────────────
    op.create_table(
        "vendors",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("type", sa.String(64), nullable=False),
        sa.Column("mobile", sa.String(64), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("tds_certificate_url", sa.String(1024), nullable=True),
        sa.Column("pan", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # ── 4. vehicles ──────────────────────────────────────────────────────────
    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("number", sa.String(64), nullable=False),
        sa.Column("type", sa.String(128), nullable=True),
        sa.Column("capacity", sa.String(64), nullable=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("vendors.id"), nullable=True),
        sa.Column("status", sa.String(32), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("number", name="uq_vehicles_number"),
    )

    # ── 5. cities ────────────────────────────────────────────────────────────
    op.create_table(
        "cities",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("state", sa.String(128), nullable=True),
        sa.Column("code", sa.String(32), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("code", name="uq_cities_code"),
        sa.UniqueConstraint("name", "state", name="uq_cities_name_state"),
    )

    # ── 6. templates ─────────────────────────────────────────────────────────
    op.create_table(
        "templates",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("file_url", sa.String(1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # ── 7. contracts ─────────────────────────────────────────────────────────
    op.create_table(
        "contracts",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("client_id", sa.Integer(), sa.ForeignKey("clients.id"), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("expiry_alert_days", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # ── 8. lrs ───────────────────────────────────────────────────────────────
    # pod_file_id is a plain integer (no FK) to avoid a circular dependency
    # with file_uploads.  The application layer enforces the relationship.
    op.create_table(
        "lrs",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("lr_number", sa.String(64), nullable=False),
        sa.Column("date", sa.Date(), nullable=True),
        sa.Column("consignor_id", sa.String(64), nullable=True),
        sa.Column("consignor_name", sa.String(256), nullable=True),
        sa.Column("consignee_id", sa.String(64), nullable=True),
        sa.Column("consignee_name", sa.String(256), nullable=True),
        sa.Column("origin", sa.String(128), nullable=True),
        sa.Column("destination", sa.String(128), nullable=True),
        sa.Column("delivery_at", sa.String(256), nullable=True),
        sa.Column("through_id", sa.Integer(), nullable=True),
        sa.Column("through", sa.String(256), nullable=True),
        sa.Column("fob", sa.String(128), nullable=True),
        sa.Column("fob_client_id", sa.Integer(), nullable=True),
        sa.Column("goods_items", postgresql.JSONB(), nullable=True),
        sa.Column("articles_count", sa.Integer(), nullable=True),
        sa.Column("articles_description", sa.Text(), nullable=True),
        sa.Column("weight", sa.Numeric(12, 2), nullable=True),
        sa.Column("freight_amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("vehicle_id", sa.Integer(), nullable=True),
        sa.Column("vehicle_number", sa.String(32), nullable=True),
        sa.Column("vehicle_type", sa.String(64), nullable=True),
        sa.Column("seal_number", sa.String(64), nullable=True),
        sa.Column("driver_name", sa.String(128), nullable=True),
        sa.Column("driver_mobile", sa.String(32), nullable=True),
        sa.Column("booked_on_owners_risk", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("loading_point_times", postgresql.JSONB(), nullable=True),
        sa.Column("value_rs", sa.Numeric(12, 2), nullable=True),
        sa.Column("surcharge", sa.Numeric(12, 2), nullable=True),
        sa.Column("hamali_charges", sa.Numeric(12, 2), nullable=True),
        sa.Column("st_charges", sa.Numeric(12, 2), nullable=True),
        sa.Column("total", sa.Numeric(12, 2), nullable=True),
        sa.Column("bill_number", sa.String(64), nullable=True),
        sa.Column("bill_date", sa.Date(), nullable=True),
        sa.Column("amount_passed", sa.Numeric(12, 2), nullable=True),
        sa.Column("deductions", sa.String(256), nullable=True),
        sa.Column("cm_no", sa.String(64), nullable=True),
        sa.Column("cm_date", sa.Date(), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("pod_url", sa.String(1024), nullable=True),
        sa.Column("pod_verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("pod_received", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("pod_file_id", sa.Integer(), nullable=True),
        sa.Column("eway_bill_no", sa.String(64), nullable=True),
        sa.Column("eway_bill_expiry", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(64), server_default="DRAFT", nullable=False),
        sa.Column("financial_year", sa.String(7), nullable=False, server_default="2025-26"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("lr_number", name="uq_lrs_lr_number"),
    )

    # ── 9. hirememos ─────────────────────────────────────────────────────────
    op.create_table(
        "hirememos",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("lr_id", sa.Integer(), sa.ForeignKey("lrs.id"), nullable=False),
        sa.Column("total_amount", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("advance_cash", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("advance_bank", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("advance_payment_date", sa.Date(), nullable=True),
        sa.Column("balance", sa.Numeric(12, 2), nullable=True),
        sa.Column("balance_payment_date", sa.Date(), nullable=True),
        sa.Column("driver_name", sa.String(128), nullable=True),
        sa.Column("driver_mobile", sa.String(32), nullable=True),
        sa.Column("driver_license", sa.String(64), nullable=True),
        sa.Column("hire_memo_no", sa.String(64), nullable=True),
        sa.Column("hire_memo_date", sa.Date(), nullable=True),
        sa.Column("branch", sa.String(64), nullable=True),
        sa.Column("vehicle_id", sa.Integer(), sa.ForeignKey("vehicles.id"), nullable=True),
        sa.Column("vehicle_number", sa.String(32), nullable=True),
        sa.Column("from_location", sa.String(128), nullable=True),
        sa.Column("to_location", sa.String(128), nullable=True),
        sa.Column("payment_location", sa.String(128), nullable=True),
        sa.Column("rate_type", sa.String(32), nullable=True),
        sa.Column("freight_rate", sa.Numeric(12, 2), nullable=True),
        sa.Column("freight_weight", sa.Numeric(12, 2), nullable=True),
        sa.Column("guaranteed_weight", sa.Numeric(12, 2), nullable=True),
        sa.Column("commission", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("hamali", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("mamul", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("other_deductions", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("ack_status", sa.String(32), server_default="PENDING", nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("financial_year", sa.String(7), nullable=False, server_default="2025-26"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("hire_memo_no", "financial_year", name="uq_hirememos_no_fy"),
    )

    # ── 10. file_uploads ─────────────────────────────────────────────────────
    op.create_table(
        "file_uploads",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("document_type", sa.String(64), nullable=False),
        sa.Column("lr_id", sa.Integer(), sa.ForeignKey("lrs.id"), nullable=True),
        sa.Column("hirememo_id", sa.Integer(), sa.ForeignKey("hirememos.id"), nullable=True),
        sa.Column("original_filename", sa.String(512), nullable=False),
        sa.Column("stored_filename", sa.String(256), nullable=False),
        sa.Column("storage_path", sa.String(1024), nullable=False),
        sa.Column("file_url", sa.String(1024), nullable=False),
        sa.Column("content_type", sa.String(128), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("checksum", sa.String(64), nullable=True),
        sa.Column("uploaded_by", sa.String(128), nullable=True),
        sa.Column("is_archived", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_file_uploads_document_type", "file_uploads", ["document_type"])
    op.create_index("ix_file_uploads_lr_id", "file_uploads", ["lr_id"])
    op.create_index("ix_file_uploads_hirememo_id", "file_uploads", ["hirememo_id"])

    # ── 11. invoices ─────────────────────────────────────────────────────────
    op.create_table(
        "invoices",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("invoice_no", sa.String(64), nullable=False),
        sa.Column("invoice_date", sa.Date(), nullable=False),
        sa.Column("client_id", sa.Integer(), sa.ForeignKey("clients.id"), nullable=False),
        sa.Column("financial_year", sa.String(7), nullable=False, server_default="2025-26"),
        sa.Column("po_no", sa.String(64), nullable=True),
        sa.Column("po_date", sa.Date(), nullable=True),
        sa.Column("hsn_code", sa.String(16), server_default="996791", nullable=True),
        sa.Column("reverse_charge", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("gst_paid_by", sa.String(64), nullable=True),
        sa.Column("total_amount", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("tds_amount", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("net_amount", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("status", sa.String(32), server_default="draft", nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("invoice_no", "financial_year", name="uq_invoices_no_fy"),
    )

    # ── 12. invoice_lines ────────────────────────────────────────────────────
    op.create_table(
        "invoice_lines",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("invoice_id", sa.Integer(), sa.ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lr_id", sa.Integer(), sa.ForeignKey("lrs.id"), nullable=True),
        sa.Column("s_no", sa.Integer(), nullable=True),
        sa.Column("lr_no", sa.String(64), nullable=True),
        sa.Column("lr_date", sa.Date(), nullable=True),
        sa.Column("qty", sa.Numeric(12, 2), nullable=True),
        sa.Column("particulars", sa.Text(), nullable=True),
        sa.Column("v_type", sa.String(64), nullable=True),
        sa.Column("vehicle_no", sa.String(32), nullable=True),
        sa.Column("consignor", sa.String(256), nullable=True),
        sa.Column("consignee", sa.String(256), nullable=True),
        sa.Column("from_city", sa.String(100), nullable=True),
        sa.Column("to_city", sa.String(100), nullable=True),
        sa.Column("freight", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("loading_detention", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("unloading_charges", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("unloading_detention", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("other_charges", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("total", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # ── 13. payment_receipts ─────────────────────────────────────────────────
    op.create_table(
        "payment_receipts",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("invoice_id", sa.Integer(), sa.ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True),
        sa.Column("received_from_id", sa.Integer(), sa.ForeignKey("clients.id"), nullable=True),
        sa.Column("received_from", sa.String(256), nullable=False),
        sa.Column("total_billed_amount", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("tds_deducted", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("net_amount", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("other_deduction", sa.Numeric(12, 2), server_default="0", nullable=True),
        sa.Column("deduction_remarks", sa.Text(), nullable=True),
        sa.Column("payment_mode", sa.String(32), server_default="BANK", nullable=True),
        sa.Column("financial_year", sa.String(7), nullable=False, server_default="2025-26"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_payment_receipts_invoice_id", "payment_receipts", ["invoice_id"])
    op.create_index("ix_payment_receipts_received_from_id", "payment_receipts", ["received_from_id"])

    # ── 14. vouchers ─────────────────────────────────────────────────────────
    op.create_table(
        "vouchers",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("voucher_type", sa.String(64), nullable=False),
        sa.Column("reference_id", sa.Integer(), nullable=True),
        sa.Column("reference_type", sa.String(64), nullable=True),
        sa.Column("amount", sa.Numeric(12, 2), server_default="0", nullable=False),
        sa.Column("narration", sa.Text(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("financial_year", sa.String(7), nullable=False, server_default="2025-26"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )

    # ── 15. eway_bills ───────────────────────────────────────────────────────
    op.create_table(
        "eway_bills",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("lr_id", sa.Integer(), sa.ForeignKey("lrs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("number", sa.String(128), nullable=False),
        sa.Column("valid_from", sa.Date(), nullable=True),
        sa.Column("valid_upto", sa.Date(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(32), nullable=True),
        sa.Column("alert_sent", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("file_url", sa.String(1024), nullable=True),
        sa.Column("extension_count", sa.Integer(), server_default="0", nullable=True),
        sa.Column("last_extended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("meta", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_eway_bills_lr_id", "eway_bills", ["lr_id"])

    # ── 16. vehicle_locations ────────────────────────────────────────────────
    op.create_table(
        "vehicle_locations",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("lr_id", sa.Integer(), sa.ForeignKey("lrs.id"), nullable=True),
        sa.Column("vehicle_number", sa.String(), nullable=False),
        sa.Column("location", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("reported_by", sa.String(), nullable=True),
        sa.Column("reported_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_vehicle_locations_vehicle_number", "vehicle_locations", ["vehicle_number"])
    op.create_index("ix_vehicle_locations_lr_id", "vehicle_locations", ["lr_id"])
    op.create_index("ix_vehicle_locations_reported_at", "vehicle_locations", ["reported_at"],
                    postgresql_ops={"reported_at": "DESC NULLS LAST"})

    # ── 17. audit_log ────────────────────────────────────────────────────────
    op.create_table(
        "audit_log",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("entity_type", sa.String(64), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(16), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("user_name", sa.String(128), nullable=True),
        sa.Column("before_data", postgresql.JSONB(), nullable=True),
        sa.Column("after_data", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_audit_log_entity", "audit_log", ["entity_type", "entity_id"])
    op.create_index("ix_audit_log_created_at", "audit_log", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_log")
    op.drop_index("ix_vehicle_locations_reported_at", "vehicle_locations")
    op.drop_index("ix_vehicle_locations_lr_id", "vehicle_locations")
    op.drop_index("ix_vehicle_locations_vehicle_number", "vehicle_locations")
    op.drop_table("vehicle_locations")
    op.drop_index("ix_eway_bills_lr_id", "eway_bills")
    op.drop_table("eway_bills")
    op.drop_table("vouchers")
    op.drop_index("ix_payment_receipts_received_from_id", "payment_receipts")
    op.drop_index("ix_payment_receipts_invoice_id", "payment_receipts")
    op.drop_table("payment_receipts")
    op.drop_table("invoice_lines")
    op.drop_table("invoices")
    op.drop_index("ix_file_uploads_hirememo_id", "file_uploads")
    op.drop_index("ix_file_uploads_lr_id", "file_uploads")
    op.drop_index("ix_file_uploads_document_type", "file_uploads")
    op.drop_table("file_uploads")
    op.drop_table("hirememos")
    op.drop_table("lrs")
    op.drop_table("contracts")
    op.drop_table("templates")
    op.drop_table("cities")
    op.drop_table("vehicles")
    op.drop_table("vendors")
    op.drop_table("clients")
    op.drop_table("users")
