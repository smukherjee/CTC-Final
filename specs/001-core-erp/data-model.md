# Data Model: CTC-ERP Core (001-core-erp)

**Phase**: 1 — Design  
**Date**: 2026-03-05  
**Status**: Final — all entities confirmed

---

## Entity Relationship Overview

```
Party ──────────────────────────────────┐
  │ (1:N invoices, 1:N lrs)             │
  │                                     ▼
LR (lrs) ──── HireMemo (hirememos)   Invoice (invoices)
  │                                     │ 1:N
  └────────────────────────────────► InvoiceLine (invoice_lines)

PaymentReceipt (payment_receipts) — standalone, linked to party by name only
Voucher (vouchers) — FY-scoped; auto-created from HireMemo advances
Vehicle (vehicles) — referenced by LR
Vendor (vendors) — referenced by LR (through/broker)
```

---

## 1. `lrs` — MODIFIED

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | SERIAL | PK | |
| `lr_no` | VARCHAR(50) | NOT NULL | Manual entry |
| `date` | DATE | NOT NULL | Dispatch date |
| `financial_year` | VARCHAR(7) | NOT NULL DEFAULT '2025-26' | **NEW** e.g. `2025-26` |
| `consignor_id` | INTEGER | FK → parties.id | |
| `consignee_id` | INTEGER | FK → parties.id | |
| `origin` | VARCHAR(100) | | |
| `destination` | VARCHAR(100) | | |
| `qty` | INTEGER | | |
| `vehicle_no` | VARCHAR(20) | | |
| `driver_mobile` | VARCHAR(15) | | Grid-visible column |
| `through_id` | INTEGER | FK → vendors.id | Broker/Vendor |
| `fob_party_id` | INTEGER | FK → parties.id | FOB → Party Master |
| `bill_no` | VARCHAR(50) | | |
| `remarks` | TEXT | | |
| `eway_bill_no` | VARCHAR(50) | | Inline-editable in grid |
| `eway_bill_expiry` | TIMESTAMP | | Alert trigger |
| `pod_received` | BOOLEAN | DEFAULT FALSE | |
| `pod_file_id` | INTEGER | FK → file_uploads.id | |
| `hire_memo_id` | INTEGER | FK → hirememos.id | |
| `created_at` | TIMESTAMP | DEFAULT now() | |

---

## 2. `hirememos` — MODIFIED

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | SERIAL | PK | |
| `hire_memo_no` | INTEGER | NOT NULL | **Auto-generated** per FY |
| `financial_year` | VARCHAR(7) | NOT NULL DEFAULT '2025-26' | **NEW** |
| `lr_id` | INTEGER | FK → lrs.id | |
| `date` | DATE | NOT NULL | |
| `vehicle_no` | VARCHAR(20) | | |
| `driver_name` | VARCHAR(100) | | |
| `driver_mobile` | VARCHAR(15) | | |
| `driver_license` | VARCHAR(50) | | |
| `total_hire` | NUMERIC(12,2) | NOT NULL | |
| `advance_cash` | NUMERIC(12,2) | DEFAULT 0 | |
| `advance_bank` | NUMERIC(12,2) | DEFAULT 0 | |
| `balance` | NUMERIC(12,2) | GENERATED | `total_hire - advance_cash - advance_bank` |
| `remarks` | TEXT | | |
| `created_at` | TIMESTAMP | DEFAULT now() | |

**Constraints**:
- `UNIQUE(hire_memo_no, financial_year)` — prevents duplicates within a FY
- `hire_memo_no` is assigned by `next_hirememo_seq(session, fy)` — no manual override

---

## 3. `vendors` — MODIFIED (DROP gstin)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | SERIAL | PK | |
| `name` | VARCHAR(200) | NOT NULL | |
| `contact` | VARCHAR(100) | | |
| `mobile` | VARCHAR(15) | | |
| `vehicle_types` | TEXT | | JSON or CSV |
| `pan_no` | VARCHAR(10) | | |
| ~~`gstin`~~ | ~~VARCHAR(15)~~ | **DROPPED** | Vendor/Broker has no GSTIN |

---

## 4. `bills` — MODIFIED (legacy BillBook rows)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | SERIAL | PK | |
| `bill_no` | VARCHAR(50) | | |
| `bill_date` | DATE | | |
| `lr_id` | INTEGER | FK → lrs.id | |
| `lr_date` | DATE | | **NEW** |
| `origin` | VARCHAR(100) | | **NEW** |
| `destination` | VARCHAR(100) | | **NEW** |
| `party_id` | INTEGER | FK → parties.id | Customer |
| `amount` | NUMERIC(12,2) | | Billed amount |
| `amount_passed` | NUMERIC(12,2) | | Cleared amount |
| `deductions` | NUMERIC(12,2) | | |
| `tds_amount` | NUMERIC(12,2) | DEFAULT 0 | **NEW** |
| `net_amount` | NUMERIC(12,2) | GENERATED | **NEW** `amount_passed - tds_amount` |
| `financial_year` | VARCHAR(7) | NOT NULL DEFAULT '2025-26' | **NEW** |
| `remarks` | TEXT | | |
| `cm_no` | VARCHAR(50) | | Credit memo |
| `cm_date` | DATE | | |

---

## 5. `invoices` — NEW

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | SERIAL | PK | |
| `invoice_no` | VARCHAR(20) | NOT NULL | Auto: `{seq}/YY-YY` e.g. `1543/25-26` |
| `invoice_date` | DATE | NOT NULL | |
| `party_id` | INTEGER | FK → parties.id | Bill-to party |
| `financial_year` | VARCHAR(7) | NOT NULL | e.g. `2025-26` |
| `po_no` | VARCHAR(100) | | Client PO number |
| `po_date` | DATE | | Client PO date |
| `hsn_code` | VARCHAR(10) | DEFAULT '996791' | HSN for transport services |
| `reverse_charge` | BOOLEAN | DEFAULT FALSE | RCM applies? |
| `gst_paid_by` | VARCHAR(255) | | Party name paying GST |
| `total_amount` | NUMERIC(12,2) | NOT NULL | Sum of line item totals |
| `tds_amount` | NUMERIC(12,2) | DEFAULT 0 | |
| `net_amount` | NUMERIC(12,2) | GENERATED | `total_amount - tds_amount` |
| `status` | VARCHAR(20) | DEFAULT 'draft' | `draft`, `issued`, `paid` |
| `created_at` | TIMESTAMP | DEFAULT now() | |

**Constraints**:
- `UNIQUE(invoice_no, financial_year)`

---

## 6. `invoice_lines` — NEW

One row per LR within an invoice (16-column annexure structure).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | SERIAL | PK | |
| `invoice_id` | INTEGER | FK → invoices.id ON DELETE CASCADE | |
| `lr_id` | INTEGER | FK → lrs.id | |
| `s_no` | INTEGER | NOT NULL | Line sequence |
| `lr_no` | VARCHAR(50) | | Denormalised for PDF |
| `lr_date` | DATE | | |
| `qty` | INTEGER | | |
| `particulars` | TEXT | | Goods description |
| `v_type` | VARCHAR(50) | | Vehicle type |
| `vehicle_no` | VARCHAR(20) | | |
| `consignor` | VARCHAR(200) | | |
| `consignee` | VARCHAR(200) | | |
| `from_city` | VARCHAR(100) | | |
| `to_city` | VARCHAR(100) | | |
| `freight` | NUMERIC(10,2) | DEFAULT 0 | |
| `loading_detention` | NUMERIC(10,2) | DEFAULT 0 | |
| `unloading_charges` | NUMERIC(10,2) | DEFAULT 0 | |
| `unloading_detention` | NUMERIC(10,2) | DEFAULT 0 | |
| `other_charges` | NUMERIC(10,2) | DEFAULT 0 | |
| `total` | NUMERIC(10,2) | GENERATED | Sum of above charge columns |

---

## 7. `payment_receipts` — NEW

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | SERIAL | PK | |
| `payment_date` | DATE | NOT NULL | |
| `amount` | NUMERIC(12,2) | NOT NULL | |
| `received_from` | VARCHAR(255) | NOT NULL | Client name (free text) |
| `financial_year` | VARCHAR(7) | NOT NULL | e.g. `2025-26` |
| `notes` | TEXT | | Optional remarks |
| `created_at` | TIMESTAMP | DEFAULT now() | |

---

## 8. `vouchers` — NEW

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | SERIAL | PK | |
| `voucher_type` | VARCHAR(20) | NOT NULL | `cash`, `bank`, `debit`, `credit` |
| `reference_id` | INTEGER | | FK to source entity (e.g., hirememo.id) |
| `reference_type` | VARCHAR(50) | | e.g. `hirememo`, `invoice`, `payment_receipt` |
| `amount` | NUMERIC(12,2) | NOT NULL | |
| `narration` | TEXT | | Description / purpose |
| `date` | DATE | NOT NULL | Voucher date |
| `financial_year` | VARCHAR(7) | NOT NULL | e.g. `2025-26` |
| `created_at` | TIMESTAMP | DEFAULT now() | |

**Note**: Auto-created by `voucher_service.py` when HireMemo advance is saved. Indexed by `financial_year` for LedgerBook queries.

---

## Shared Utilities

### `backend/app/core/financial_year_utils.py`

```python
from datetime import date
from decimal import Decimal
from sqlalchemy.orm import Session

def get_current_fy() -> str:
    today = date.today()
    year = today.year if today.month >= 4 else today.year - 1
    return f"{year}-{str(year+1)[2:]}"

def fy_from_date(d: date) -> str:
    year = d.year if d.month >= 4 else d.year - 1
    return f"{year}-{str(year+1)[2:]}"

def next_invoice_seq(session: Session, fy: str) -> int:
    from app.models.invoice import Invoice
    count = session.query(Invoice).filter(Invoice.financial_year == fy).count()
    return count + 1

def next_hirememo_seq(session: Session, fy: str) -> int:
    from app.models.hirememo import HireMemo
    count = session.query(HireMemo).filter(HireMemo.financial_year == fy).count()
    return count + 1

def format_invoice_no(seq: int, fy: str) -> str:
    short_fy = fy[2:].replace("-", "-")  # "2025-26" -> "25-26"
    return f"{seq}/{short_fy}"
```

### `backend/app/core/amount_in_words.py`

Implements `inr_words(amount: Decimal) -> str` using Indian numbering (lakh, crore). See research.md §1 for implementation.

---

## State Transitions

### Invoice Status
```
draft → issued → paid
               ↗
         partial
```

### LR/POD Status
```
dispatched → pod_received → billed → cleared
```

---

## Migration Execution Order

```
1. YYYYMMDD_add_financial_year_to_lrs.py
2. YYYYMMDD_add_financial_year_to_hirememos.py
3. YYYYMMDD_enhance_bills_table.py         (+ financial_year, tds_amount, net_amount, lr_date, origin, destination)
4. YYYYMMDD_drop_vendor_gstin.py
5. YYYYMMDD_create_invoices.py
6. YYYYMMDD_create_invoice_lines.py
7. YYYYMMDD_create_payment_receipts.py
```
