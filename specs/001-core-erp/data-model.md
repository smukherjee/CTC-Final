# Data Model: CTC-ERP Core (001-core-erp)

**Phase**: 1 - Design  
**Date**: 2026-03-15

## Entities

- `LR`
- `LRDeduction`
- `HireMemo`
- `Invoice`
- `InvoiceLine`
- `PaymentReceipt`
- `Client`
- `Vendor`

## Relationships

- `LR (1) -> (N) LRDeduction`
- `Invoice (1) -> (N) InvoiceLine`
- `InvoiceLine (N) -> (1) LR`
- `Client (1) -> (N) Invoice`
- `Client (1) -> (N) PaymentReceipt`
- `LR (0..1) -> (1) HireMemo`

## Entity Specifications

### LR

Key fields:
- `id`, `lr_number`, `lr_date`, `financial_year`
- `consignor_id`, `consignee_id`, `client_id`
- `origin`, `destination`, `vehicle_no`, `driver_mobile`
- `freight_amount`, `hamali_charges`, `st_charges`, `mamul`, `total`

Validation:
- `financial_year` must match `YYYY-YY`.
- `total >= 0`.

### LRDeduction

Key fields:
- `id`, `lr_id`, `deduction_label`, `deduction_amount`, `sort_order`

Validation:
- `deduction_amount >= 0`.
- fixed INR amount only (no percent mode).
- `deduction_label` cannot be blank.

### HireMemo

Key fields:
- `id`, `hirememo_number`, `financial_year`, `lr_id`
- `total_hire`, `advance_cash`, `advance_bank`, `balance`

Validation:
- unique `(financial_year, hirememo_number)`.
- `balance = total_hire - advance_cash - advance_bank`.

### Invoice

Key fields:
- `id`, `invoice_number`, `invoice_date`, `financial_year`, `client_id`
- `po_number`, `po_date`, `hsn_code`, `gst_paid_by`, `tax_on_reverse_charge`
- `gross_amount`, `tds_amount`, `net_amount`, `status`

Validation:
- unique `(financial_year, invoice_number)`.
- `net_amount = gross_amount - tds_amount`.

### InvoiceLine

Key fields:
- `id`, `invoice_id`, `lr_id`
- `line_amount` (copied from LR `total`)
- display snapshot fields (vehicle/route/party names)

Validation:
- no duplicate LR in the same invoice.
- line amount must be derived from LR total; not manually recomposed in invoice.

### PaymentReceipt

Key fields:
- `id`, `payment_date`, `amount`, `received_from`, `received_from_id`, `financial_year`, `notes`

Validation:
- `amount > 0`.
- no commercial deduction fields on this entity.

## Derived Formulas

- `LR.total = gross_operational_components - sum(LRDeduction.deduction_amount)`
- `Invoice.gross_amount = sum(InvoiceLine.line_amount)`
- `Invoice.net_amount = Invoice.gross_amount - Invoice.tds_amount`
- `Outstanding = sum(invoice.net_amount) - sum(payment_receipt.amount)`

## State Transitions

### Invoice

- `draft -> issued -> partially_paid -> paid`

Guard conditions:
- `issued`: has at least one line.
- `partially_paid`: cumulative receipt amount is > 0 and < net amount.
- `paid`: cumulative receipt amount is >= net amount.

### LR Billing State (derived)

- `unbilled`: LR not linked to any invoice line.
- `billed`: LR linked to an invoice line.
