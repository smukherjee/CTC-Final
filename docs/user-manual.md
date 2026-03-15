# User Manual and Admin Guide

## Roles

- `OPS`: operational modules (LR, tracking, POD)
- `ACCOUNTS`: finance modules (billing, receipts, vouchers, ledger, reports)
- `ADMIN`: full access

## Core Daily Workflow

1. Create LR entries in Dispatch Register.
2. Update tracking and POD status as shipment progresses.
3. Generate invoices from billable LRs.
4. Record payment receipts as amount-based events.
5. Review outstanding and pending-billing reports.

## Dispatch and POD

- Use `Operations > Dispatch Register` for LR creation and updates.
- Maintain E-way details and driver/vehicle data.
- Mark POD received once proof is uploaded/verified.

## Billing (Finance)

- Open `Finance > Bill Book`.
- Select client and FY, then create invoice from eligible LRs.
- TDS is header-level; invoice net is computed automatically.
- Use print action to open invoice template output.

## Payment Receipts (Finance)

- Open `Finance > Payment Receipts`.
- Create receipt with date, amount, payer, FY, and notes.
- Link invoice where applicable for automatic outstanding/status updates.
- Receipt workflow is amount-only; deduction fields are not part of this form.

## Ledger and Vouchers (Finance)

- Open `Finance > Ledger`.
- Filter by FY and review debit, credit, and running balance.
- Hire memo advances auto-generate voucher entries.

## Reports

- Open `Reports` page.
- Use tabs:
	- `Pending Billing`: aged POD-complete but unbilled LRs
	- `Outstanding Receivables`: client-wise open balance summary
- Always select FY before exporting/reviewing report totals.

## Troubleshooting

- Finance screen hidden or blocked: verify `X-User-Role` is `ADMIN` or `ACCOUNTS`.
- Empty report: verify FY filter and source transactions exist.
- Invoice outstanding mismatch: verify linked payment receipts and receipt amounts.
