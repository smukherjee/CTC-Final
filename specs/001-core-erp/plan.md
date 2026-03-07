# Implementation Plan: CTC-ERP Core (001-core-erp)

**Branch**: `001-core-erp` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-erp/spec.md`

## Summary

CTC-ERP is a web-based logistics ERP replacing manual paper registers with a centralized digital system. The core feature set covers 10 functional areas: Dispatch/LR, Hire Memo, Tracking, POD, Billing/Invoice, Payment Receipts, Vouchers, Master Data, Security, and Reporting.

The system is a **React + FastAPI + PostgreSQL** stack. A partial backend (models + API routes for LR, HireMemo, Party, Vendor, City, Contract, EwayBill, Vehicle) already exists. The primary remaining gaps (Mar 2026) are: Invoice model + service, PaymentReceipt model + service, `financial_year` on all register entities, BillBook enhancements (TDS/NET columns, per-client tabs), HireMemo enhancements (auto-numbering, 2-copy print), DispatchRegister enhancements (`driver_mobile`, inline eway, FY filter), and shared utilities (`financial_year_utils`, `amount_in_words`).

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5 (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy 2.x, Alembic, Pydantic v2, psycopg2-binary; React 18, Vite 5, Tailwind CSS 3, shadcn/ui, Handlebars (already in package.json)
**Storage**: PostgreSQL 15+ (primary); local filesystem under `backend/storage/uploads/`
**Testing**: pytest + httpx (backend); Vitest + React Testing Library (frontend)
**Target Platform**: Web browser (Chrome/Firefox latest); Uvicorn + nginx on Linux server
**Project Type**: Web application — `backend/` + `frontend/` dual-project layout
**Performance Goals**: PDF generation < 3s; grid load < 1s for ≤ 5,000 rows; standard CRUD SLAs
**Constraints**: No offline; file uploads PDF/JPG/PNG max 10 MB; FY resets April 1; Vendor/Broker has no GSTIN
**Scale/Scope**: ~10 concurrent users; ~50 screens; ~17 DB tables post-migration

### Universal FY Filter Pattern (All Register Screens)

Every register screen (DispatchRegister, HireMemoRegister, BillBook, PaymentReceipts, PODManagement, LedgerBook, Reports, TrackingLog, Vouchers list) MUST implement:

- **Dropdown selector** in the toolbar/header showing:
  - Current FY (Indian: April 1 – March 31) as **default selected value**
  - 3 immediately prior FYs
  - Example (March 2026): `[2025-26*, 2024-25, 2023-24, 2022-23]` (* = default)
- **API integration**: on selection change, call `GET /api/{resource}/?fy={selected_fy}`
- **Utility function**: `getCurrentFy()` from `utils/financialYear.ts` provides current FY; `generateFyDropdownOptions()` generates the 4-year array
- **Consistency**: All screens use identical dropdown component/styling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file is a blank placeholder — no project-specific gates are defined yet. **No violations to evaluate.** Re-check when constitution is filled in.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-erp/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── invoice.yaml
│   ├── payment-receipt.yaml
│   └── hirememo.yaml
└── tasks.md             ← 71 tasks (updated Mar 2026)
```

### Source Code Layout

**Structure Decision**: Web application — `backend/` (FastAPI) + `frontend/` (React/Vite) dual-project layout.

```text
backend/
├── app/
│   ├── main.py                        # EXISTS: add new router registrations
│   ├── db.py                          # EXISTS
│   ├── core/
│   │   ├── financial_year_utils.py    # NEW
│   │   └── amount_in_words.py         # NEW
│   ├── models/
│   │   ├── lr.py                      # MODIFY: + financial_year
│   │   ├── hirememo.py                # MODIFY: + financial_year
│   │   ├── vendor.py                  # MODIFY: DROP gstin
│   │   ├── invoice.py                 # NEW: Invoice + InvoiceLine
│   │   └── payment_receipt.py         # NEW
│   ├── schemas/
│   │   ├── invoice.py                 # NEW
│   │   └── payment_receipt.py         # NEW
│   ├── services/
│   │   ├── hirememo_service.py        # MODIFY: auto-numbering
│   │   ├── billing_service.py         # NEW
│   │   └── payment_receipt_service.py # NEW
│   └── api/
│       ├── billing.py                 # NEW
│       └── payment_receipts.py        # NEW
└── alembic/versions/
    ├── YYYYMMDD_add_financial_year_to_lrs.py
    ├── YYYYMMDD_add_financial_year_to_hirememos.py
    ├── YYYYMMDD_create_invoices.py
    ├── YYYYMMDD_create_invoice_lines.py
    ├── YYYYMMDD_create_payment_receipts.py
    ├── YYYYMMDD_enhance_bills_table.py
    └── YYYYMMDD_drop_vendor_gstin.py

frontend/src/
├── features/
│   ├── operations/
│   │   ├── DispatchRegister.tsx       # MODIFY: driver_mobile, inline eway, FY filter
│   │   └── CreateLR.tsx               # MODIFY: FOB -> Party Master
│   ├── hirememo/
│   │   ├── HireMemo.tsx               # MODIFY: 2-copy print, amount_in_words
│   │   └── HireMemoRegister.tsx       # NEW
│   ├── finance/
│   │   ├── BillBook.tsx               # MODIFY: new columns, per-client tabs, FY filter
│   │   ├── PaymentReceiptsRegister.tsx# NEW
│   │   └── InvoiceForm.tsx            # NEW
│   └── vendor/
│       └── VendorMaster.tsx           # MODIFY: remove GSTIN field
└── utils/
    ├── financialYear.ts              # NEW
    ├── amountInWords.ts              # NEW
    ├── printInvoice.ts               # NEW
    └── printVoucher.ts               # NEW
templates/
    ├── invoice-template.hbs          # NEW (exists: hirememo-template.hbs, lr-template.hbs)
    └── voucher-template.hbs          # NEW
```

## Complexity Tracking

No constitution violations apply. No over-engineering warranted.

---

## Phase 0: Research Findings

*See [research.md](./research.md) for full decision log.*

| Decision | Choice | Rationale |
|----------|--------|-----------|
| INR amount-in-words | Custom utility — Python `amount_in_words.py` (backend) + TypeScript `amountInWords.ts` (frontend) | No PyPI/npm package handles lakh/crore; same ~40 LOC algorithm in both languages |
| FY-scoped auto-numbering | COUNT query per FY + DB UNIQUE constraint | Simple; thread-safe; no Redis |
| Invoice/Voucher print | Handlebars frontend template + `window.print()` | Matches existing `printHireMemo.ts` + `printLR.ts` pattern; zero new dependencies |
| `financial_year` format | `YYYY-YY` string e.g. `2025-26` | Matches sample documents; lexicographically sortable |
| Reverse charge | `reverse_charge BOOLEAN` + `gst_paid_by VARCHAR` | Matches sample invoice exactly |
| Per-client BillBook tabs | `party_id` filter + tab UI | Party model exists; no denormalization needed |
| HireMemo 2-copy print | CSS `@media print` two-section layout | Zero extra dependencies |
| TDS rate | Configurable per-client (on Party/Contract) | Not hardcoded; client requirement |

---

## Phase 1: Design

### Data Model Summary

*See [data-model.md](./data-model.md) for full field tables and ERD.*

| Entity | Table | Status | Key Changes |
|--------|-------|--------|-------------|
| LR | `lrs` | Modify | + `financial_year VARCHAR(7)` |
| HireMemo | `hirememos` | Modify | + `financial_year VARCHAR(7)` |
| Vendor | `vendors` | Modify | DROP `gstin` |
| Bill (legacy) | `bills` | Modify | + `financial_year`, `tds_amount`, `net_amount` |
| Invoice | `invoices` | New | Full model — see data-model.md |
| InvoiceLine | `invoice_lines` | New | 16-column annexure rows per LR |
| PaymentReceipt | `payment_receipts` | New | `payment_date`, `amount`, `received_from`, `financial_year`, `notes` |

### API Contracts Summary

*See [contracts/](./contracts/) for OpenAPI YAML fragments.*

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/billing/invoices` | GET, POST | List and create invoices |
| `/api/billing/invoices/{id}` | GET, PUT, DELETE | Invoice CRUD |
| `/api/payment-receipts/` | GET, POST | List and create payment receipts |
| `/api/payment-receipts/{id}` | PUT, DELETE | Update and delete |

*Note: No PDF endpoint — invoice and voucher printing is handled entirely in the browser via Handlebars templates (`printInvoice.ts`, `printVoucher.ts`), matching the existing `printHireMemo.ts` / `printLR.ts` pattern.*

### Quickstart

*See [quickstart.md](./quickstart.md) for local dev setup.*

---

## Phase 2: Implementation Milestones

### Milestone 1 — Foundational Utilities (blocks all others)
**Tasks**: T004–T012, T071
- `financial_year_utils.py`, `amount_in_words.py`, `amountInWords.ts`, `financialYear.ts`
- Alembic migrations: `financial_year` on `lrs`, `hirememos`, `bills`; DROP `gstin` from `vendors`; `tds_rate` on `parties`

### Milestone 2 — Dispatch Register Enhancements (US1)
**Tasks**: T017–T023
- DispatchRegister: `driver_mobile` column, inline E-way bill editing, FOB→Party Master, FY filter

### Milestone 3 — Hire Memo Enhancements (US2)
**Tasks**: T024–T030
- HireMemo auto-numbering per FY, 2-copy print, amount_in_words, HireMemoRegister list view

### Milestone 4 — Invoice Register + PDF (US5)
**Tasks**: T039–T050
- Invoice + InvoiceLine models, billing service (create + PDF), BillBook columns + tabs + FY filter

### Milestone 5 — Payment Receipts Register (US6)
**Tasks**: T051–T056
- PaymentReceipt model + API + UI register

### Milestone 6 — Security & Reporting
**Tasks**: T061–T064, T065–T070
- JWT auth + roles, pending billing and outstanding receivables reports, contract expiry alert, Docker deployment

---

## Key Dependencies

```
Milestone 1 (utilities + migrations)
  └─► Milestones 2, 3, 4, 5  (all need financial_year on entities)
Milestone 4 Invoice model
  └─► Milestone 4 PDF (InvoicePDF requires Invoice record)
Milestone 5 independent of Milestone 4
```

---

## Files To Be Created / Modified

### Backend (new files)
- `backend/app/core/financial_year_utils.py`
- `backend/app/core/amount_in_words.py`
- `backend/app/models/invoice.py`
- `backend/app/schemas/invoice.py`
- `backend/app/services/billing_service.py`
- `backend/app/api/billing.py`
- `backend/app/models/payment_receipt.py`
- `backend/app/schemas/payment_receipt.py`
- `backend/app/services/payment_receipt_service.py`
- `backend/app/api/payment_receipts.py`
- 7 Alembic migration files (see Project Structure above)

### Backend (modified)
- `backend/app/models/lr.py` — add `financial_year`
- `backend/app/models/hirememo.py` — add `financial_year`; HM auto-number via service
- `backend/app/models/vendor.py` — remove `gstin`
- `backend/app/services/hirememo_service.py` — auto-numbering
- `backend/app/main.py` — register `billing` and `payment_receipts` routers

### Frontend (new files)
- `frontend/src/features/hirememo/HireMemoRegister.tsx`
- `frontend/src/features/finance/PaymentReceiptsRegister.tsx`
- `frontend/src/features/finance/InvoiceForm.tsx`
- `frontend/src/utils/financialYear.ts`
- `frontend/src/utils/amountInWords.ts`
- `frontend/src/utils/printInvoice.ts`
- `frontend/src/utils/printVoucher.ts`
- `frontend/src/templates/invoice-template.hbs`
- `frontend/src/templates/voucher-template.hbs`

### Frontend (modified)
- `frontend/src/features/operations/DispatchRegister.tsx`
- `frontend/src/features/operations/CreateLR.tsx`
- `frontend/src/features/hirememo/HireMemo.tsx`
- `frontend/src/features/finance/BillBook.tsx`
- `frontend/src/features/vendor/VendorMaster.tsx`
