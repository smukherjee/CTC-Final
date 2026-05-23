# Implementation Checklist: Invoice Billing Controls and Deduction Normalization

Feature Spec: `specs/002-invoice-billing-controls/spec.md`

## Execution Notes

- Sequence: DB -> Backend (models/schemas/services/APIs) -> Frontend -> Print Template -> Tests -> Data validation.
- Ensure all calculations are backend-authoritative.
- Keep zero-downtime compatible migration approach where possible.

## A) Database Changes

- [ ] Create migration for `invoice_lines` table additions:
  - `deduction_label` (nullable string)
  - `deduction_amount` numeric(12,2) default 0 not null
  - `gross_total` numeric(12,2) default 0 not null
  - `net_total` numeric(12,2) default 0 not null
- [ ] Add DB check constraints:
  - `deduction_amount >= 0`
  - `gross_total >= 0`
  - `net_total >= 0`
  - `deduction_amount <= gross_total`
- [ ] Backfill script:
  - For existing rows: `deduction_amount=0`, `gross_total=existing total`, `net_total=existing total`
- [ ] Verify migration rollback path.

## B) Backend Model and Schema Changes

- [ ] Update model `backend/app/models/invoice.py` (`InvoiceLineModel`) with new fields.
- [ ] Update schema `backend/app/schemas/invoice.py`:
  - add line fields in create/update/response models
  - validators for non-negative values
  - validator for `deduction_amount <= gross_total`
- [ ] Ensure response includes computed fields for UI and print.

## C) Backend Service Logic

- [ ] Update `backend/app/services/billing_service.py` line creation/update compute logic:
  - compute `gross_total` from charge components
  - compute `net_total = gross_total - deduction_amount`
  - set persisted `line.total = net_total` (or migrate consumers to `net_total` explicitly)
- [ ] Ensure header totals are always recomputed server-side:
  - `invoice.total_amount = sum(line.net_total)`
  - `invoice.net_amount = max(total_amount - tds_amount, 0)`
- [ ] Preserve paid-invoice edit lock behavior.
- [ ] Keep audit logging for before/after values.

## D) API Contract Updates

- [ ] Update invoice create/update endpoints to accept deduction fields.
- [ ] Update invoice read/list endpoints to return deduction + gross/net line fields.
- [ ] Update API docs/examples.
- [ ] Confirm backward compatibility for requests from old UI (missing deduction fields should default to 0).

## E) Payment Receipt Integrity

- [ ] Retain formula in `payment_receipt_service`:
  - `net_amount = total_billed_amount - tds_deducted - other_deduction`
- [ ] Confirm over-allocation checks remain enforced against invoice outstanding.
- [ ] Add service-level note/guard to avoid accidental repeated commercial deduction already captured in invoice line.

## F) Frontend UI: Invoice Form

- [ ] Update `frontend/src/features/finance/InvoiceForm.tsx` line draft type:
  - add `deduction_label`, `deduction_amount`, `gross_total`, `net_total`
- [ ] Add editable inputs per line for deduction label and deduction amount.
- [ ] Add computed display columns:
  - Gross Total
  - Net Total
- [ ] Update line total function usage:
  - gross for display, net for invoice aggregation
- [ ] Keep negative-entry prevention on amount fields.

## G) Frontend UI: Invoice Register

- [ ] Verify `BillBook` totals continue to reflect invoice header totals after backend changes.
- [ ] Optional: add indicator column "Has Deductions".

## H) Frontend UI: Payment Receipts Register

- [ ] Add helper text: invoice amount may already include line-level commercial deductions.
- [ ] Ensure no automatic extra deduction is applied when selecting invoice outstanding.

## I) Print Template Changes

- [ ] Update invoice print data mapper (`frontend/src/utils/printInvoice.ts`):
  - include `deduction_label`, `deduction_amount`, `gross_total`, `net_total`
- [ ] Update template `frontend/src/templates/invoice-template.hbs`:
  - print `LESS: <label> -<amount>` when deduction exists
  - print line net amount as final amount column
- [ ] Validate final printed total equals sum of line net totals.
- [ ] Regression check formatting for invoices without deductions.

## J) Validation and Error Messaging

- [ ] Add explicit user-facing validation messages:
  - "Deduction cannot exceed gross amount"
  - "Amount fields cannot be negative"
- [ ] Ensure API returns structured validation details for UI display.

## K) Tests

### Unit Tests (Backend)

- [ ] Compute line gross/net with deduction.
- [ ] Reject deduction greater than gross.
- [ ] Header total recomputation from line net totals.
- [ ] Net amount floor at zero after TDS.
- [ ] Receipt over-allocation rejection.

### Integration/API Tests

- [ ] Create invoice with line deduction and verify persisted fields.
- [ ] Update invoice deduction and verify recalculated totals.
- [ ] List/get invoice returns expected deduction fields.
- [ ] Print payload includes expected deduction fields.

### Frontend Tests

- [ ] Invoice form computes and displays gross/net correctly.
- [ ] Submission payload includes deduction fields.
- [ ] Print preview/output shows LESS line correctly.

## L) Reconciliation and UAT Checklist

- [ ] Sample case validation:
  - Gross 62,000
  - Less seal cost 20
  - Net 61,980
  - Two lines total = 1,23,960
- [ ] Verify Invoice Register totals and outstanding after receipts.
- [ ] Verify no double deduction in receipt entry flow.
- [ ] Verify paid invoice cannot be edited.

## M) Deployment Plan

- [ ] Run DB migration in staging.
- [ ] Deploy backend with backward-compatible schema handling.
- [ ] Deploy frontend and print template updates.
- [ ] Run smoke tests (create invoice, print, add receipt, view register).
- [ ] Run post-deploy reconciliation report for first 1 week.

## N) Documentation Updates

- [ ] Update `calculation.md` cross-reference to feature spec and checklist.
- [ ] Add user manual note for deduction entry and print behavior.
- [ ] Add accounting SOP note for posting method selection (Method A vs Method B).
