"""ensure fy numbering constraints

Revision ID: 0003_fy_numbering_constraints
Revises: 0002_add_lr_deductions_table
Create Date: 2026-03-15
"""

from alembic import op


revision = "0003_fy_numbering_constraints"
down_revision = "0002_add_lr_deductions_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ensure unique constraints for FY-scoped numbering exist.
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'uq_hirememos_no_fy'
            ) THEN
                ALTER TABLE hirememos
                ADD CONSTRAINT uq_hirememos_no_fy UNIQUE (hire_memo_no, financial_year);
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'uq_invoices_no_fy'
            ) THEN
                ALTER TABLE invoices
                ADD CONSTRAINT uq_invoices_no_fy UNIQUE (invoice_no, financial_year);
            END IF;
        END
        $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'uq_hirememos_no_fy'
            ) THEN
                ALTER TABLE hirememos DROP CONSTRAINT uq_hirememos_no_fy;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'uq_invoices_no_fy'
            ) THEN
                ALTER TABLE invoices DROP CONSTRAINT uq_invoices_no_fy;
            END IF;
        END
        $$;
        """
    )
