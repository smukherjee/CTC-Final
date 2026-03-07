# Tasks: CTC-ERP Core (001-core-erp)

**Input**: Design documents from `/specs/001-core-erp/` (plan.md, spec.md, data-model.md, contracts/, research.md)
**Branch**: `001-core-erp` | **Date**: 2026-03-05
**Stack**: FastAPI + SQLAlchemy + Alembic (backend) · React 18 + Vite + Tailwind (frontend) · PostgreSQL 15
**Tests**: Not included — add explicitly if TDD is required.
**Organization**: Grouped by user story mapped to spec.md FR1–FR10. Each phase is independently testable.

---

## Phase 1: Setup

**Purpose**: Verify the existing project scaffolding starts cleanly before any new work begins.

- [X] T001 Verify backend starts: `uvicorn app.main:app --reload` on port 8000 with no import errors (backend/)
- [X] T002 [P] Verify frontend starts: `npm run dev` on port 5173 with no build errors (frontend/)
- [X] T003 [P] Confirm `handlebars` is present in `frontend/package.json` (already used by `printHireMemo.ts`); confirm `npm install` succeeds with no errors (frontend/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities and DB migrations that ALL user story phases depend on.
**⚠️ CRITICAL**: No user story work starts until this phase is complete and `alembic upgrade head` passes.

- [X] T004 Create `financial_year_utils.py`: `get_current_fy()`, `fy_from_date(date)`, `next_invoice_seq(session, fy)`, `next_hirememo_seq(session, fy)`, `format_invoice_no(seq, fy)` → e.g. `"1543/25-26"` (backend/app/core/financial_year_utils.py)
- [X] T005 [P] Create `amount_in_words.py`: `inr_words(amount: Decimal) -> str` — Indian lakh/crore numbering, e.g. `"Rupees One Lakh Five Thousand Only"` (backend/app/core/amount_in_words.py)
- [X] T006 Create Alembic migration: add `financial_year VARCHAR(7) NOT NULL DEFAULT '2025-26'` to `lrs` table; update `LR` SQLAlchemy model (backend/alembic/versions/20260305_add_fy_to_lrs.py, backend/app/models/lr.py)
- [X] T007 [P] Create Alembic migration: add `financial_year VARCHAR(7) NOT NULL DEFAULT '2025-26'` to `hirememos`; add `UNIQUE(hire_memo_no, financial_year)`; update `HireMemo` model (backend/alembic/versions/20260305_add_fy_to_hirememos.py, backend/app/models/hirememo.py)
- [X] T008 [P] Create Alembic migration: add `financial_year`, `tds_amount NUMERIC`, `net_amount NUMERIC`, `lr_date DATE`, `origin VARCHAR(100)`, `destination VARCHAR(100)` to `bills` table (backend/alembic/versions/20260305_enhance_bills.py)
- [X] T009 [P] Create Alembic migration: DROP `gstin` column from `vendors` table; update `backend/app/models/vendor.py` to remove the `gstin` SQLAlchemy column definition (backend/alembic/versions/20260305_drop_vendor_gstin.py, backend/app/models/vendor.py)
- [X] T010 [P] Create Alembic migration: add `tds_rate NUMERIC(5,2) DEFAULT 0` to `clients` table; update `Client` SQLAlchemy model (backend/alembic/versions/20260305_add_tds_rate_to_clients.py, backend/app/models/client.py)
- [X] T011 [P] Create frontend FY utility: `getCurrentFy()`, `fyFromDate(date: Date): string`, `generateFyDropdownOptions(): string[]` — returns array `[currentFY, currentFY-1, currentFY-2, currentFY-3]` e.g. `['2025-26', '2024-25', '2023-24', '2022-23']` (frontend/src/utils/financialYear.ts)
- [X] T071 [P] Create frontend amount-in-words utility: `inrWords(amount: number): string` — TypeScript port of `inr_words()` using Indian lakh/crore numbering, e.g. `"Rupees One Lakh Five Thousand Only"` (frontend/src/utils/amountInWords.ts) **[prerequisite for T028 and T050]**
- [X] T012 Run `alembic upgrade head` and confirm all T006–T010 migrations apply cleanly (backend/)

---

## Phase 3: User Story 8 — Master Data Enhancements (Priority: P1) [US8]

- [X] T013a Globally rename "client" entities/fields/routes to "Client" including DB table migration, frontend labels, schemas, documentation, and seed data.


**Goal**: Vendor and Client master data matches spec — no Vendor GSTIN, Client has editable TDS rate.

**Independent Test**: GET `/api/vendor/` — confirm no `gstin` in response. Open clientMaster UI — confirm TDS Rate field is present, saves, and is returned by GET `/api/client/{id}`.

- [X] T013 [US8] Update `Vendor` Pydantic schemas: remove `gstin` from `VendorCreate` and `VendorResponse` (backend/app/schemas/vendor.py)
- [X] T014 [P] [US8] Remove GSTIN input field from VendorMaster form UI (frontend/src/features/vendor/VendorMaster.tsx)
- [X] T015 [US8] Add `tds_rate` to `clientCreate`/`clientResponse` Pydantic schemas; update client API to accept and return it (backend/app/schemas/client.py, backend/app/api/client.py)
- [X] T016 [P] [US8] Add TDS Rate numeric input to clientMaster form UI (frontend/src/features/client/clientMaster.tsx)

---

## Phase 4: User Story 1 — Centralized Dispatch Register (Priority: P1) [US1]

**Goal**: All LR operations are FY-scoped; `driver_mobile` is visible in the grid; E-way Bill fields are inline-editable; FOB links to client Master.

**Independent Test**: POST `/api/lr/` → confirm response contains `financial_year`; open DispatchRegister — confirm `driver_mobile` column visible, E-way Bill cells editable, FY filter changes grid content, FOB dropdown shows client names.

- [X] T017 [US1] Update `lr_service.create_lr()`: auto-populate `financial_year` via `fy_from_date(lr.date)`; update `GET /api/lr/` to accept `?fy=` query parameter for filtering (backend/app/services/lr_service.py, backend/app/api/lr.py)
- [X] T018 [P] [US1] Update `LRCreate`/`LRResponse` schemas: add `financial_year`; accept `fob_client_id INTEGER` (backend/app/schemas/lr.py)
- [X] T019 [US1] Add `PATCH /api/lr/{id}` endpoint accepting `eway_bill_no`, `eway_bill_expiry` for inline grid updates (backend/app/api/lr.py)
- [X] T020 [US1] DispatchRegister.tsx: expose `driver_mobile` as a visible, sortable grid column (frontend/src/features/operations/DispatchRegister.tsx)
- [X] T021 [US1] DispatchRegister.tsx: make E-way Bill No and Expiry Date inline-editable; call `PATCH /api/lr/{id}` on cell change (frontend/src/features/operations/DispatchRegister.tsx)
- [X] T022 [US1] DispatchRegister.tsx: add FY filter dropdown showing current FY + 3 prior years (via `generateFyDropdownOptions()`), defaulting to `getCurrentFy()`; on change, reload grid via `GET /api/lr/?fy={selected}` (frontend/src/features/operations/DispatchRegister.tsx)
- [X] T023 [US1] CreateLR.tsx: replace FOB free-text input with client Master dropdown (`GET /api/client/`); store `fob_client_id` on submit (frontend/src/features/operations/CreateLR.tsx)

---

## Phase 5: User Story 2 — Hire Memo Management (Priority: P1) [US2]

**Goal**: Hire Memos are auto-numbered per FY; print produces 2 copies with amount-in-words; a browsable register is available.

**Independent Test**: POST `/api/hirememos/` twice in the same FY → confirm `hire_memo_no` is 1, then 2; print UI shows "Original Copy" and "Book Copy" sections; HireMemoRegister lists both entries filtered by FY.

- [X] T024 [US2] Update `hirememo_service.create_hirememo()`: assign `hire_memo_no` via `next_hirememo_seq(session, fy)`; auto-set `financial_year` via `fy_from_date()`; block any manual `hire_memo_no` input (backend/app/services/hirememo_service.py)
- [X] T025 [US2] Update `HireMemoCreate` schema: remove `hire_memo_no` field; add `financial_year` to `HireMemoResponse` (backend/app/schemas/hirememo.py)
- [X] T026 [US2] Update HireMemo API: confirm create uses updated service; add `?fy=` query param to `GET /api/hirememos/` list endpoint for filtering by financial year (backend/app/api/hirememo.py)
- [X] T027 [US2] HireMemo.tsx: implement 2-copy print layout — "Original Copy" (upper half) and "Book Copy" (lower half) on one page via CSS `@media print` (frontend/src/features/hirememo/HireMemo.tsx)
- [X] T028 [US2] HireMemo.tsx: add "Amount in words" line to print output using `inrWords(total_hire)` from `utils/amountInWords.ts` (requires T071) (frontend/src/features/hirememo/HireMemo.tsx)
- [X] T029 [P] [US2] Create `HireMemoRegister.tsx`: list/grid with FY filter dropdown (current + 3 prior years, default to current); columns: HM No, Date, LR No, Vehicle No, Driver, Total Hire, Balance; call `GET /api/hirememos/?fy={selected}`; route `/hire-memo-register` (frontend/src/features/hirememo/HireMemoRegister.tsx)
- [X] T030 [US2] Add `/hire-memo-register` route to frontend router and nav link under Operations (frontend/src/App.tsx)

---

## Phase 6: User Story 3 — Tracking & E-way Bill Alerts (Priority: P1) [US3]

**Goal**: Tracking staff log daily location/status; dashboard shows in-app alert for E-way Bills expiring within 8 hours on undelivered LRs.

**Independent Test**: Create an LR with `eway_bill_expiry` 4 hours from now and `pod_received=false` → refresh Dashboard → confirm alert banner appears. Log `vehicle_location` entry → confirm it appears in tracking log.

- [X] T031 [US3] Add `GET /api/lr/eway-expiring?hours=8`: returns LRs where `pod_received=false` AND `eway_bill_expiry ≤ NOW() + interval '8 hours'` (backend/app/api/lr.py)
- [X] T032 [P] [US3] Update Vehicle Location API: confirm `POST /api/vehicle-locations/` accepts `lr_id`, `location`, `status`, `timestamp`; add `GET /api/vehicle-locations/` with `?fy=` query param to filter by the financial year of the linked LR (backend/app/api/vehicle_location.py)
- [X] T033 [US3] Dashboard.tsx: on load and every 5 min, call `GET /api/lr/eway-expiring?hours=8`; render dismissable in-app alert banner per result (frontend/src/pages/Dashboard.tsx)
- [X] T034 [P] [US3] Create Tracking Log screen: form to submit daily `lr_id` + location + status; read feed below with FY filter dropdown (current + 3 prior years); call `GET /api/vehicle-locations/?fy={selected}` to filter historical logs by LR's FY (frontend/src/features/tracking/TrackingLog.tsx)

---

## Phase 7: User Story 4 — POD Management (Priority: P1) [US4]

**Goal**: Accounts staff can flag POD receipt and upload a digital POD file; searchable by LR No or Vehicle No.

**Independent Test**: Upload a PDF via `POST /api/files/upload` → use returned `file_id` in `PATCH /api/lr/{id}/pod` → open POD Management screen and search by LR No → confirm entry shows as POD received.

- [X] T035 [US4] Add `PATCH /api/lr/{id}/pod`: accepts `{ pod_received: bool, pod_file_id?: int }`; updates `lrs` record (backend/app/api/lr.py)
- [X] T036 [P] [US4] Validate `POST /api/files/upload`: enforce PDF/JPG/PNG content type and ≤ 10 MB; return 400 on violation (backend/app/api/files.py)
- [X] T037 [US4] Create `PODManagement.tsx`: searchable LR list by LR No / Vehicle No with FY filter dropdown (current + 3 prior years, default to current); call `GET /api/lr/?fy={selected}&pod_status=...`; "Flag POD" button and file upload widget per row (frontend/src/features/pod/PODManagement.tsx)
- [X] T038 [US4] Add `/pod` route to frontend router and nav (frontend/src/App.tsx)

---

## Phase 8: User Story 5 — Billing & Invoice Register (Priority: P2) [US5]

**Goal**: Accounts staff create FY-scoped auto-numbered invoices, view them per client in an enriched BillBook grid, and download a compliant PDF with 16-column annexure.

**Independent Test**: POST `/api/billing/invoices` with 2 LR lines → `invoice_no` is `"1/25-26"`; BillBook.tsx shows TDS_AMOUNT, NET_AMOUNT, ORIGIN, DESTINATION, LR_DATE columns; download PDF → contains PO No, HSN 996791, 2 annexure rows, amount-in-words, reverse charge block.

- [X] T039 [US5] Create `Invoice` SQLAlchemy model: `id, invoice_no, invoice_date, client_id, financial_year, po_no, po_date, hsn_code DEFAULT '996791', reverse_charge BOOL, gst_paid_by, total_amount, tds_amount, net_amount, status DEFAULT 'draft'` (backend/app/models/invoice.py)
- [X] T040 [US5] Create `InvoiceLine` SQLAlchemy model: `id, invoice_id FK, lr_id FK, s_no, lr_no, lr_date, qty, particulars, v_type, vehicle_no, consignor, consignee, from_city, to_city, freight, loading_detention, unloading_charges, unloading_detention, other_charges, total` (backend/app/models/invoice.py)
- [X] T041 [P] [US5] Create Alembic migration: `invoices` table with `UNIQUE(invoice_no, financial_year)` (backend/alembic/versions/20260305_create_invoices.py)
- [X] T042 [P] [US5] Create Alembic migration: `invoice_lines` table with `FK(invoice_id) ON DELETE CASCADE` (backend/alembic/versions/20260305_create_invoice_lines.py)
- [X] T043 [US5] Create `InvoiceCreate`, `InvoiceLineCreate`, `InvoiceResponse`, `InvoiceLineResponse` Pydantic schemas (backend/app/schemas/invoice.py)
- [X] T044 [US5] Implement `billing_service.create_invoice()`: auto-assign `invoice_no` via `format_invoice_no(next_invoice_seq(session, fy), fy)`; compute `net_amount = total_amount - tds_amount`; persist Invoice + InvoiceLines (backend/app/services/billing_service.py)
- [X] T045 [US5] Create `invoice-template.hbs`: Handlebars HTML/CSS template — company header, BILL TO block, invoice no + date, PO no + date, HSN 996791, 16-col landscape annexure table per LR line, deduction lines, totals, `{{amountInWords}}` token, reverse charge block, authorised signatory; create `printInvoice.ts` utility following the same pattern as `printHireMemo.ts` (compile template, format data, `window.open()` + `window.print()`) (frontend/src/templates/invoice-template.hbs, frontend/src/utils/printInvoice.ts)
- [X] T046 [US5] Add billing API router: `GET/POST /api/billing/invoices`, `GET/PUT/DELETE /api/billing/invoices/{id}`; register in main.py (no PDF endpoint — printing is frontend-only) (backend/app/api/billing.py, backend/app/main.py)
- [X] T047 [US5] BillBook.tsx: add missing grid columns — LR_DATE, ORIGIN, DESTINATION, TDS_AMOUNT, NET_AMOUNT (NET_AMOUNT read-only = AMOUNT_PASSED − TDS_AMOUNT) (frontend/src/features/finance/BillBook.tsx)
- [X] T048 [US5] BillBook.tsx: add per-client tab navigation — load unique clients from invoices; each tab filters by `client_id`; show outstanding total (sum of `status != 'paid'` invoices) per tab (frontend/src/features/finance/BillBook.tsx)
- [X] T049 [US5] BillBook.tsx: add FY filter dropdown showing current FY + 3 prior years (via `generateFyDropdownOptions()`), defaulting to `getCurrentFy()`; on change, reload per-client tabs via `GET /api/billing/invoices/?fy={selected}&client_id=...` (frontend/src/features/finance/BillBook.tsx)
- [X] T050 [P] [US5] Create `InvoiceForm.tsx`: client selector, invoice date, PO no/date, batch LR selector (checkboxes), per-line charge inputs, TDS amount, Print button calling `printInvoice()` from `utils/printInvoice.ts` (requires T045, T071) (frontend/src/features/finance/InvoiceForm.tsx)

---

## Phase 9: User Story 6 — Payment Receipts Register (Priority: P2) [US6]

**Goal**: Accounts staff log and browse payments received from clients in a dedicated FY-scoped register separate from invoice passing.

**Independent Test**: POST `/api/payment-receipts/` with `payment_date`, `amount`, `received_from`, `financial_year="2025-26"`; open `/payment-receipts` UI — entry appears; changing FY filter to another year hides it.

- [X] T051 [P] [US6] Create `PaymentReceipt` SQLAlchemy model and Alembic migration: `id, payment_date, amount, received_from, financial_year, notes, created_at` (backend/app/models/payment_receipt.py, backend/alembic/versions/20260305_create_payment_receipts.py)
- [X] T052 [US6] Create `PaymentReceiptCreate`, `PaymentReceiptResponse` Pydantic schemas (backend/app/schemas/payment_receipt.py)
- [X] T053 [US6] Implement `payment_receipt_service.py`: `create()`, `list(fy)`, `update()`, `delete()` (backend/app/services/payment_receipt_service.py)
- [X] T054 [US6] Add Payment Receipts API router: `GET/POST /api/payment-receipts/` (with `?fy=` filter), `PUT/DELETE /api/payment-receipts/{id}`; register in main.py (backend/app/api/payment_receipts.py, backend/app/main.py)
- [X] T055 [US6] Create `PaymentReceiptsRegister.tsx`: grid with PAYMENT DATE, AMOUNT, RECEIVED FROM, NOTES; FY filter dropdown (current + 3 prior years, default to current); call `GET /api/payment-receipts/?fy={selected}`; inline add/edit/delete row actions (frontend/src/features/finance/PaymentReceiptsRegister.tsx)
- [X] T056 [US6] Add `/payment-receipts` route to frontend router; add nav link under Finance section (frontend/src/App.tsx)

---

## Phase 10: User Story 7 — Voucher & Ledger Automation (Priority: P3) [US7]

**Goal**: Print-ready debit vouchers are auto-created from HireMemo advance entries; Cash Book and Bank Book populate automatically.

**Independent Test**: Create HireMemo with cash advance → GET `/api/vouchers/` → confirm debit voucher entry exists; GET `/api/vouchers/{id}/pdf` → download and verify it shows HM no, amount, payee.

- [X] T057 [P] [US7] Create `Voucher` SQLAlchemy model and Alembic migration: `id, voucher_type, reference_id, reference_type, amount, narration, date, financial_year VARCHAR(7) NOT NULL, created_at` (backend/app/models/voucher.py, backend/alembic/versions/20260305_create_vouchers.py)
- [X] T058 [US7] Implement `voucher_service.py`: auto-create debit voucher record when HireMemo advance is saved (no backend PDF); create `voucher-template.hbs` Handlebars template and `printVoucher.ts` utility following the same pattern as `printHireMemo.ts` (backend/app/services/voucher_service.py, frontend/src/templates/voucher-template.hbs, frontend/src/utils/printVoucher.ts)
- [X] T059 [US7] Add Voucher API: `GET /api/vouchers/` with `?fy=` query parameter to filter by financial year; register in main.py (no PDF endpoint — printing via `printVoucher.ts` frontend utility) (backend/app/api/vouchers.py, backend/app/main.py)
- [X] T060 [P] [US7] Create `LedgerBook.tsx`: tabbed Cash Book / Bank Book — Date, Narration, Debit, Credit, Running Balance columns; FY filter dropdown (current + 3 prior years, default to current); call `GET /api/vouchers/?fy={selected}&voucher_type=cash|bank` (frontend/src/features/finance/LedgerBook.tsx)

---

## Phase 11: User Story 9 — Security & Access Control (Priority: P2) [US9]

**Goal**: All API routes require a valid JWT; financial screens (billing, payments, vouchers) are restricted to the Accounts role.

**Independent Test**: `GET /api/billing/invoices` without a token → 401. Log in as Dispatch role → navigate to `/bills` → redirected to Access Denied page.

- [ ] T061 [US9] Implement JWT auth endpoints: `POST /api/auth/login` returns access token; `GET /api/auth/me` returns `{id, name, role}` (backend/app/api/user.py, backend/app/core/security.py)
- [ ] T062 [US9] Add `Depends(get_current_user)` to all existing API routers (`lr.py`, `hirememo.py`, `client.py`, `vendor.py`, `contract.py`, `ewaybill.py`, `vehicle.py`, `vehicle_location.py`, `files.py`, `city.py`) and to the new routers added in this feature (`billing.py`, `payment_receipts.py`, `vouchers.py`); restrict `/api/billing/`, `/api/payment-receipts/`, `/api/vouchers/` to `role == "Accounts"` (backend/app/api/*.py)
- [ ] T063 [P] [US9] Implement frontend auth: Login page; store JWT in localStorage; add axios interceptor for `Authorization: Bearer <token>` header; add `/login` as a public (unauthenticated) route in React Router (frontend/src/features/auth/Login.tsx, frontend/src/api/client.ts, frontend/src/router.tsx)
- [ ] T064 [US9] Add role-based route guard in React Router: redirect non-Accounts users away from `/bills`, `/payment-receipts`, `/vouchers` (frontend/src/router.tsx)

---

## Final Phase: Polish, Reporting & Deployment

- [X] T065 [P] Implement `GET /api/reports/pending-billing`: accepts `?fy=` param; returns LRs with `pod_received=true`, no linked invoice, `lrs.date < NOW() - interval '15 days'`, filtered by `lrs.financial_year = :fy` (backend/app/api/reports.py)
- [X] T066 [P] Implement `GET /api/reports/outstanding-receivables`: accepts `?fy=` param; returns unpaid invoices (`status != 'paid'`) filtered by `invoices.financial_year = :fy`, grouped by client with total outstanding (backend/app/api/reports.py)
- [X] T067 [P] Create `Reports.tsx`: "Pending Billing" tab + "Outstanding Receivables" tab; each tab has FY filter dropdown (current + 3 prior years, default to current); call `GET /api/reports/pending-billing?fy={selected}` and `GET /api/reports/outstanding-receivables?fy={selected}`; route `/reports` (frontend/src/features/reports/Reports.tsx)
- [X] T068 [P] Add Contract expiry alert: `GET /api/contracts/expiring?days=30` polled on Dashboard; render banner per expiring contract (backend/app/api/contract.py, frontend/src/pages/Dashboard.tsx)
- [X] T069 [P] Update docker-compose.yml / backend Dockerfile: run `alembic upgrade head` on container start (docker-compose.yml, backend/Dockerfile)
- [X] T070 Update README.md with local dev setup referencing quickstart.md (README.md)

---

## Dependencies

```
Phase 2 (Foundational — utilities + migrations)
  └─► ALL phases below (financial_year on tables must exist before any story work)

Phase 3 (US8 Master Data)
  └─► Phase 4 US1 (client dropdown on CreateLR FOB field needs updated client API)

Phase 4 (US1 Dispatch) ──────────────────────────┐ Can start in parallel
Phase 5 (US2 Hire Memo) ─────────────────────────┤ after Phase 2 + 3 complete
Phase 6 (US3 Tracking)  ─────────────────────────┤
Phase 9 (US6 Payment Receipts) ──────────────────┘

Phase 4 (US1 LRs) → Phase 7 (US4 POD — LRs must exist)
Phase 4 (US1 LRs) → Phase 8 (US5 Billing — LRs required for invoice lines)

Phase 8 US5 internal: T039–T042 (models + migrations) → T043 (schemas) → T044 (service) → T045 (PDF) → T046 (API)

Phase 11 (US9 Security) — implement last, after all feature routes exist
```

---

## Parallel Execution by Milestone

```
After Phase 2 completes (≈ 1 dev-day):

  Dev A → Phase 4 US1 Dispatch (T017–T023)
  Dev B → Phase 5 US2 Hire Memo (T024–T030)
  Dev C → Phase 3 US8 Master Data (T013–T016) + Phase 9 US6 Payment Receipts (T051–T056)

After Phase 4 + 5 complete:

  Dev A → Phase 8 US5 Billing (T039–T050)  ← complex; one developer
  Dev B → Phase 6 US3 Tracking (T031–T034) + Phase 7 US4 POD (T035–T038)
  Dev C → Phase 10 US7 Vouchers (T057–T060)

After all features complete:

  All → Phase 11 US9 Security (T061–T064) + Final Phase (T065–T070)
```

---

## Implementation Strategy

**MVP Scope** — Phases 1–5 (deliver together for initial parallel run):
- Clean dispatch register with FY scoping, `driver_mobile`, inline E-way bill
- Hire Memo auto-numbered + 2-copy print
- Master data clean (no Vendor GSTIN, client has TDS rate)

**Increment 2** — Phases 6–9:
- Full billing cycle: Invoice Register → PDF → Payment Receipts

**Full Delivery** — Phases 10–11 + Final:
- Vouchers, Security, Reporting, Docker deployment
