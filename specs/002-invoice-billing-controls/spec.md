# Feature Specification: Invoice Billing Controls and Deduction Normalization

## 1) Objective

Standardize and harden billing calculations from LR through Invoice and Payment Receipt so that:

- invoice values are deterministic and auditable,
- deduction treatment (for example `LESS: SEAL COST`) is explicit,
- receivable and collection values remain consistent across API, UI, and print outputs,
- transporter settlement (Hire Memo) is kept separate from customer billing unless explicitly configured.

## 2) Problem Statement

Current behavior is functionally usable but has accounting gaps:

- LR has multiple monetary totals (`freight_amount`, `total`) and billing base selection can be misinterpreted.
- Invoice line schema accepts only non-negative charge components, so negative commercial deductions are not first-class.
- Print style expects deduction representation (`LESS: ...`) but data model is deduction-agnostic.
- Risk of double deduction if invoice net already includes deduction and receipt logic subtracts again.

## 3) Scope

### In Scope

- Billing calculation standardization across LR, Invoice, and Payment Receipts.
- Explicit invoice line deduction support.
- Seal-cost deduction accounting and print handling.
- Validation and integrity controls for over-collection, duplicate billing, and negative/net invalid values.
- API and UI updates to align with data model.
- Print template updates to show gross, deduction label, deduction amount, and line net.

### Out of Scope

- GST engine redesign and tax-compliance automation beyond existing header-level TDS handling.
- Full GL engine implementation; only posting rules and data outputs needed for Tally-ready export/reporting are in scope.
- Historical data correction scripts (can be delivered as separate migration utility if requested).

## 4) Users and Roles

- Accounts user: creates/edits invoice, enters receipt, prints invoice, tracks outstanding.
- Operations user: creates LR and source charge values.
- Admin/auditor: validates integrity and reconciliation.

## 5) Business Rules

1. Billing base per LR is `LR.freight_amount` by default.
2. Invoice line total is computed from explicit components only.
3. Deductions (for example seal cost) are captured as explicit positive deduction amount and displayed as `LESS` in print.
4. Invoice net receivable is always computed as `max(invoice_total - tds_amount, 0)`.
5. Payment receipt net is computed as `total_billed_amount - tds_deducted - other_deduction`.
6. Receipt posting cannot exceed invoice outstanding.
7. Hire Memo advances/deductions do not auto-flow into customer invoice unless pass-through policy is enabled.
8. No negative persisted amount fields in charge components; deduction is a separate positive field.

## 6) Data Model Requirements

### Invoice line additions

Add fields in `invoice_lines`:

- `deduction_label` (string, nullable)  
  Example: `SEAL COST`
- `deduction_amount` (numeric(12,2), non-negative, default 0)
- `gross_total` (numeric(12,2), non-negative, default 0)
- `net_total` (numeric(12,2), non-negative, default 0)

Retain existing charge components:

- `freight`, `loading_detention`, `unloading_charges`, `unloading_detention`, `other_charges`.

### Computed definitions

- `gross_total = freight + loading_detention + unloading_charges + unloading_detention + other_charges`
- `net_total = gross_total - deduction_amount`
- Constraint: `deduction_amount <= gross_total`

### Header consistency

- `invoices.total_amount = sum(invoice_lines.net_total)`
- `invoices.net_amount = max(total_amount - tds_amount, 0)`

## 7) API Requirements

### Invoice Create/Update API

- Accept and persist `deduction_label`, `deduction_amount` at line level.
- Compute line `gross_total`, `net_total` server-side (ignore any client attempts to override computed values).
- Compute invoice header totals server-side.
- Reject payload when:
  - any amount component is negative,
  - `deduction_amount > gross_total`,
  - resulting line or invoice net is negative.

### Invoice Read API

- Return line-level:
  - `gross_total`, `deduction_label`, `deduction_amount`, `net_total`.
- Return header-level:
  - `total_amount`, `tds_amount`, `net_amount`, `amount_received`, `outstanding_amount`.

### Payment Receipt API

- Keep current net formula.
- Enforce no over-allocation beyond outstanding.
- Ensure no double-deduction scenario by requiring `total_billed_amount` represent invoice-side billed amount already after commercial line deductions.

## 8) UI Requirements

### Invoice Form

- Add editable columns/fields:
  - Deduction Label
  - Deduction Amount
- Show line-level computed:
  - Gross Total
  - Net Total
- Keep all base charge fields non-negative.
- Lock edit for paid invoices (existing behavior remains).

### Invoice Register

- Continue showing:
  - Amount Passed (invoice total), TDS, Net, Amount Received, Outstanding.
- Optional enhancement: show a boolean/flag if invoice contains deductions.

### Payment Receipts Register

- Keep current net formula and validations.
- Add helper text when invoice has line deductions: "Invoice amount already net of line deductions. Do not repeat deduction here unless receipt-specific deduction."

## 9) Print Template Requirements

For each invoice line, print in this order:

1. Freight/charge details (gross component values)
2. If deduction exists:
   - `LESS: <deduction_label>  -<deduction_amount>`
3. Line net amount

Footer totals:

- Sum of line net totals as invoice total.
- TDS and Net receivable exactly as API output.

## 10) Posting Rules (Tally-ready)

### Seal-cost deduction posting options

Method A (default recommended): Net revenue booking

- Dr Customer (Sundry Debtor): Line Net / Invoice Net
- Cr Transport Income: Line Net / Invoice Gross Total

Method B (analytical reporting): Gross with contra

- Dr Customer: Line Net
- Dr Seal Cost Deduction (Contra Income): Deduction Amount
- Cr Transport Income: Line Gross

Receipt stage rule:

- If deduction already applied in invoice line net, do not deduct same amount again in receipt.

## 11) Acceptance Criteria

1. Invoice with `freight=62000`, `deduction_label=SEAL COST`, `deduction_amount=20` stores line `gross_total=62000`, `net_total=61980`.
2. Printed invoice shows `LESS: SEAL COST -20.00` and overall total matches sum of line net values.
3. Invoice header total equals sum of line net totals.
4. Invoice net equals header total minus TDS.
5. Receipt cannot exceed invoice outstanding.
6. Paid invoice remains non-editable.
7. No negative amount accepted in charge component fields.
8. Any attempt to set deduction > gross is rejected with validation error.

## 12) Non-Functional Requirements

- Backward compatibility for old invoices without deduction fields (treated as zero deduction).
- Migration must be safe for existing production rows.
- Computation must be deterministic on backend regardless of UI input ordering.
- Audit logs must record before/after values for invoice updates.

## 13) Risks and Mitigations

- Risk: historical invoice print mismatch after introducing deduction fields.
  - Mitigation: versioned print renderer fallback for legacy rows.
- Risk: user confusion between line deductions and receipt deductions.
  - Mitigation: explicit UI labels and helper text.
- Risk: dual posting method confusion.
  - Mitigation: configure one default method globally (Method A) and document method switch policy.
