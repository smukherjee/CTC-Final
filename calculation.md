# Billing Calculation Blueprint (Indian CA + Tally Audit View)

Date: 15-Mar-2026
Scope: Numeric fields across LR, Hire Memo (HR), Invoice, Invoice Register, Payment Receipts, and related finance screens.

This note is written as a practical accounting-control blueprint for final billing, recovery tracking, and audit readiness.

## 1) Core Principle (Commercial + Accounting)

For client billing, **invoice amount should come from billable transport components only**. Internal/owner-side settlements (driver advance, hire memo deductions) should not silently distort customer invoice unless explicitly configured as pass-through client charge lines.

Use two parallel ledgers conceptually:

- Client Billing Track: LR -> Invoice -> Payment Receipt -> Outstanding
- Carrier Cost Track: LR -> Hire Memo -> Advance Vouchers -> Final Settlement

Both tracks can be compared at route/LR level for margin audit, but should not be mixed by default.

## 2) Screen-Wise Numeric Field Audit

## 2.1 LR Creation / LR Edit (`CreateLR`, Dispatch context)

Primary numeric fields:

- Goods line level:
	- `articles_count`
	- `weight_qtl`
	- `weight_kg`
	- `rate_per_qtl`
	- `freight_rs`
	- `freight_p`
- LR header level:
	- `articles_count` (derived sum)
	- `weight` (derived total in kg)
	- `freight_amount` (derived freight total)
	- `value_rs` (derived goods freight value)
	- `surcharge`
	- `hamali_charges`
	- `st_charges`
	- `total`
	- `amount_passed` (dispatch register column in backend model)

Observed formulas in UI:

- Per goods line freight:
	- `total_qtl = weight_qtl + (weight_kg / 100)`
	- `freight_total = total_qtl * rate_per_qtl`
	- `freight_rs = floor(freight_total)`
	- `freight_p = round((freight_total - freight_rs) * 100)`
- LR summary:
	- `goodsValue = sum(freight_rs + freight_p/100)`
	- `freight_amount = goodsValue`
	- `total = goodsValue + surcharge + hamali_charges + st_charges`

CA note:

- `value_rs` naming is confusing; currently it mirrors freight-derived goods value, not declared goods insurance value.
- Keep `freight_amount` as canonical base for billing pick-up into invoice line unless commercial policy says include surcharge/hamali/ST as separate lines.

## 2.2 Dispatch Register (`DispatchRegister`)

Numeric impact:

- Mostly operational edits of LR fields.
- No additional calculation logic beyond LR persistence.
- Cannot delete LR if linked to invoice lines (control for accounting integrity).

CA note:

- Good control: linked LR cannot be deleted once billed.
- Recommended: also prevent edits to billable numeric fields after invoice issue unless via controlled amendment workflow.

## 2.3 Hire Memo Entry (`HireMemo`)

Primary numeric fields:

- `freight_rate`
- `freight_weight`
- `guaranteed_weight`
- `total_amount`
- `advance_cash`
- `advance_bank`
- `balance`
- `commission`
- `hamali`
- `mamul`
- `other_deductions`

Observed formulas and links:

- Balance:
	- `balance = total_amount - advance_cash - advance_bank`
- Validation:
	- `advance_cash + advance_bank <= total_amount`
- Link with LR:
	- `hirememo.hamali` auto-linked from `lr.hamali_charges`
	- `mamul` forced to `0.0` in current service sync
- Voucher impact:
	- `advance_cash` -> cash debit voucher (`HIREMEMO_ADVANCE_CASH`)
	- `advance_bank` -> bank debit voucher (`HIREMEMO_ADVANCE_BANK`)

CA note:

- Hire memo is carrier/vehicle settlement side and should remain separate from client receivable.
- If commercial arrangement requires recovery of hamali/mamul/other deductions from client, post as explicit invoice line charges, not implicit netting.

## 2.4 Hire Memo Register (`HireMemoRegister`)

Displayed/editable numeric fields:

- `total_amount`
- `advance_cash`
- `advance_bank`
- `balance`

CA note:

- Register is consistent with hire memo settlement tracking.
- Ensure any edit auto-resyncs vouchers and audit logs (currently present).

## 2.5 Invoice Creation/Edit (`InvoiceForm`)

Primary numeric fields:

- Header:
	- `total_amount`
	- `tds_amount`
	- `net_amount`
- Line:
	- `freight`
	- `loading_detention`
	- `unloading_charges`
	- `unloading_detention`
	- `other_charges`
	- `total`

Observed formulas:

- LR selection seeds line `freight` from `LR.freight_amount`
- Line total:
	- `line_total = freight + loading_detention + unloading_charges + unloading_detention + other_charges`
- Invoice totals:
	- `total_amount = sum(line_total)`
	- `net_amount = total_amount - tds_amount` (floored non-negative in backend compute)

CA note:

- This is the correct place to assemble final client bill.
- Good practice: detention/other recovery lines are explicit and auditable.

## 2.6 Invoice Register (`BillBook`)

Displayed numeric fields:

- `amount_passed` (mapped from invoice `total_amount`)
- `tds_amount`
- `net_amount`
- `amount_received`
- `outstanding_amount`

Observed logic:

- `amount_passed = invoice.total_amount`
- `net_amount = amount_passed - tds_amount`
- `amount_received = sum(payment_receipts.net_amount for invoice)`
- `outstanding_amount = max(net_amount - amount_received, 0)`

CA note:

- Register reflects receivable lifecycle correctly.
- Paid invoice edit lock is present (important financial control).

## 2.7 Payment Receipts Register (`PaymentReceiptsRegister`)

Primary numeric fields:

- `total_billed_amount` (currently allocated billed amount, often invoice outstanding)
- `tds_deducted`
- `other_deduction`
- `net_amount`

Observed formulas and controls:

- Receipt net:
	- `net_amount = total_billed_amount - tds_deducted - other_deduction`
- Backend prevents over-allocation beyond invoice receivable.
- Invoice status auto-syncs to `issued` / `partially_paid` / `paid` based on aggregate receipts.

CA note:

- Correct accounting treatment if `net_amount` is actual cash/bank realization.
- Keep TDS in receipt for reconciliation against Form 26AS/TDS certificates.

## 2.8 Reports (`pending-billing`, `outstanding-receivables`)

Numeric/reporting logic:

- Pending billing identifies LRs with POD done, age > 15 days, and not linked to invoice line.
- Outstanding receivables groups client-wise outstanding from invoice vs receipts.

CA note:

- This is useful for billing SLA and collection MIS.

## 2.9 Ledger Book (`LedgerBook`) and Vouchers

Numeric fields:

- Voucher `amount`
- Derived display `debit`, `credit`, `running_balance`

Observed source:

- Hire memo advances create debit vouchers (cash/bank).

CA note:

- Keep voucher trail for cash/bank movement independent from client invoice AR.

## 3) Recommended Final Invoice Relation Model (What Should Flow Into Client Invoice)

## 3.1 Canonical line formula

For each billed LR:

- `Freight_Base = LR.freight_amount`
- `Loading_Detention = user input / contractual value`
- `Unloading_Charges = user input / contractual value`
- `Unloading_Detention = user input / contractual value`
- `Other_Charges = user input / contractual value`

Then:

- `Invoice_Line_Total = Freight_Base + Loading_Detention + Unloading_Charges + Unloading_Detention + Other_Charges`

## 3.2 Canonical header formula

- `Invoice_Gross_Total = sum(Invoice_Line_Total)`
- `Invoice_TDS = header tds_amount`
- `Invoice_Net_Receivable = max(Invoice_Gross_Total - Invoice_TDS, 0)`

## 3.3 Receipt and outstanding formula

For each receipt linked to invoice:

- `Receipt_Net = total_billed_amount - tds_deducted - other_deduction`

Invoice collection status:

- `Amount_Received = sum(Receipt_Net)`
- `Outstanding = max(Invoice_Net_Receivable - Amount_Received, 0)`
- Status:
	- `issued` if received = 0
	- `partially_paid` if 0 < received < net receivable
	- `paid` if outstanding <= tolerance

## 3.4 What should NOT auto-flow into client invoice by default

- Hire memo `advance_cash`
- Hire memo `advance_bank`
- Hire memo `balance`
- Hire memo `commission`
- Hire memo `mamul`
- Hire memo `other_deductions`

Reason: these are transporter settlement/cost-side values. They can be used for margin analysis but should not auto-adjust customer AR unless contractually billable.

## 3.5 Conditional pass-through rules (if business policy requires)

If client contract says recover specific costs, map explicitly as invoice components:

- `Recover_Hamali_From_Client` -> include as `Other_Charges` line component
- `Recover_Mamul_From_Client` -> include as `Other_Charges` line component
- `Recover_ST_From_Client` -> include as tax/charge line component

Do not silently pull from hire memo; always show explicit charge labels in invoice lines.

## 3.6 Negative deduction handling (example: seal-cost less)

Many transport invoices are printed as:

- Freight amount
- `LESS: SEAL COST` (negative line)

Current application behavior note:

- Invoice line amount fields are validated as non-negative in schema/service path.
- Therefore, direct negative component entry (for example `-20`) is not a native first-class field today.

Recommended implementation policy (audit-safe):

1. Introduce explicit deduction fields at invoice line level:

- `line_deduction_label` (string, example `SEAL COST`)
- `line_deduction_amount` (positive value only, example `20.00`)

2. Compute line totals using gross-minus-deduction formula:

- `Line_Gross = Freight + Loading_Detention + Unloading_Charges + Unloading_Detention + Other_Charges`
- `Line_Net = Line_Gross - Line_Deduction_Amount`

3. Keep deduction amount positive in data; render as `LESS` only in print:

- UI/storage: `line_deduction_amount = 20.00`
- Print format: `LESS: SEAL COST -20.00`

4. Validation controls:

- `line_deduction_amount >= 0`
- `line_deduction_amount <= Line_Gross`
- `Line_Net >= 0`

5. Header formula remains unchanged:

- `Invoice_Gross_Total = sum(Line_Net)`
- `Invoice_Net_Receivable = Invoice_Gross_Total - TDS`

Interim workaround if schema change is deferred:

- Net-off deduction into line freight before save (store 61,980 instead of 62,000 and keep remark `LESS SEAL COST 20`).
- This is not preferred because deduction visibility is reduced for audit.

## 4) Proposed Data Relations for Strong Billing Integrity

## 4.1 Existing strong links (already present)

- `hirememos.lr_id -> lrs.id`
- `invoice_lines.invoice_id -> invoices.id`
- `invoice_lines.lr_id -> lrs.id`
- `payment_receipts.invoice_id -> invoices.id`

## 4.2 Recommended additional controls

- Freeze LR billable fields after invoice issue:
	- `freight_amount`, `surcharge`, `hamali_charges`, `st_charges`, `total`
- Prevent duplicate billing of same LR unless credit-note/rebill workflow.
- Enforce `invoice.total_amount == sum(invoice_lines.total)` at backend save.
- Enforce `invoice.net_amount == max(total_amount - tds_amount, 0)` centrally (single source, not user-editable).
- Enforce receipt sign/limit rules:
	- no negative `total_billed_amount`, `tds_deducted`, `other_deduction`
	- no receipt over outstanding.

## 5) Tally-Oriented Posting View (Suggested)

## 5.1 At invoice raise

- Dr Customer (Sundry Debtor): `Invoice_Net_Receivable`
- Cr Transport Income: `Invoice_Gross_Total`
- Cr TDS Receivable/Adjustments: `Invoice_TDS` (as per your accounting policy representation)

## 5.2 At receipt entry

- Dr Bank/Cash: `Receipt_Net`
- Dr TDS Receivable: `tds_deducted`
- Dr Other Deduction Account: `other_deduction`
- Cr Customer: `total_billed_amount`

## 5.3 At hire memo advance

- Dr Advance to Transporter / Freight Advance
- Cr Cash/Bank

This keeps customer billing and transporter settlement cleanly reconcilable.

## 5.4 Exact posting rule for seal-cost deduction

Assume one invoice line:

- Freight Gross: 62,000.00
- Less Seal Cost: 20.00
- Line Net billed: 61,980.00

Posting method (recommended):

Method A (net revenue booking, simple and common)

- Dr Customer (Sundry Debtor): 61,980.00
- Cr Transport Income: 61,980.00

Use this when seal cost is a pure commercial deduction reducing bill value.

Method B (gross with explicit deduction ledger, more analytical)

- Dr Customer (Sundry Debtor): 61,980.00
- Dr Seal Cost Deduction (Contra Income): 20.00
- Cr Transport Income: 62,000.00

Use this when management wants separate reporting of deduction leakage by reason.

Receipt stage treatment (important):

- If seal cost already reduced in invoice value, do not deduct again in receipt.
- Receipt should be against billed net amount.
- Otherwise deduction will be double-counted.

TDS interaction rule:

- Calculate TDS on taxable billed value after agreed commercial deduction unless contract/tax advice says otherwise.
- Keep policy fixed per client contract to avoid reconciliation disputes.

## 6) Field Flow Matrix (Quick View)

| Source Screen | Field | Flow to Invoice? | Flow Type | Notes |
|---|---|---|---|---|
| LR | `freight_amount` | Yes | Direct -> line `freight` | Base freight |
| LR | `surcharge` | Conditional | Optional charge line | If contract allows |
| LR | `hamali_charges` | Conditional | Optional charge line | Default no auto-flow |
| LR | `st_charges` | Conditional | Optional charge/tax line | Policy based |
| LR | `total` | No direct | Derived check only | Do not double count |
| Hire Memo | `total_amount` | No | Cost-side only | Transporter settlement |
| Hire Memo | `advance_cash` | No | Voucher only | Cash book impact |
| Hire Memo | `advance_bank` | No | Voucher only | Bank book impact |
| Hire Memo | `balance` | No | Cost-side control | Settlement pending |
| Hire Memo | `hamali` | Conditional | Optional line component | Only if recoverable |
| Hire Memo | `mamul` | Conditional | Optional line component | Explicit only |
| Invoice Form | `loading_detention` | Yes | Line component | Billable add-on |
| Invoice Form | `unloading_charges` | Yes | Line component | Billable add-on |
| Invoice Form | `unloading_detention` | Yes | Line component | Billable add-on |
| Invoice Form | `other_charges` | Yes | Line component | Billable add-on |
| Invoice Header | `tds_amount` | Yes | Header deduction | Net receivable calc |
| Payment Receipt | `total_billed_amount` | N/A | Collection allocation | Usually invoice outstanding |
| Payment Receipt | `tds_deducted` | N/A | Collection deduction | AR settlement component |
| Payment Receipt | `other_deduction` | N/A | Collection deduction | AR settlement component |
| Payment Receipt | `net_amount` | N/A | Cash realization | Drives amount received |

## 7) Final Recommendation for This Application

Adopt the following billing standard immediately:

- Invoice line base = LR `freight_amount`
- Additions only through explicit invoice line charges (`loading/unloading/other`)
- TDS only at invoice header
- Payment receipt net drives collections and outstanding
- Keep hire memo advances and deductions in transporter ledger path, not client invoice path, unless explicitly configured as pass-through charge policy.

This gives clean statutory compliance, easier Tally posting, and audit-proof traceability from LR to final collection.
