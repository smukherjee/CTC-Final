# CTC ERP — Bug Fixes Register

Generated: 2026-03-15
Source: DBA analysis + full-stack frontend correlation

Each fix is tracked with status and actions taken.

---

## Fix Status Key
- `[ ]` Pending
- `[x]` Complete

---

## CRITICAL

### C1 — payment_receipts: 8 ORM model columns missing from migration
**Root cause:** Migration `20260305_08` created table with 7 columns; ORM model and service use 14 columns. Every INSERT crashes on a clean deploy.
**Fix:** Migration `20260315_01` adds missing columns.
- [x] Migration `20260315_01_fix_payment_receipts_cols.py` created

---

### C2 — hirememos.mamul: column in model + service but absent from all migrations
**Root cause:** `HireMemoModel` declares `mamul`; `hirememo_service._sync_lr_financials()` writes `hm.mamul = 0.0`. Neither `0004_create_hirememos` nor `20260217_add_missing_fields` adds the column. Every hire memo create/update crashes on a clean deploy.
**Fix:** Migration `20260315_02` adds `mamul` to hirememos.
- [x] Migration `20260315_02_fix_hirememos_mamul.py` created

---

### C3 — vendors.gstin: column in DB, invisible to ORM model, schema, service, and UI
**Root cause:** Migration `0002` renamed `gst_no` → `gstin` on the `vendors` table. `VendorModel` was never updated to include the column. GSTIN data for vendors is permanently inaccessible.
**Fix:** Add `gstin` to ORM model, Pydantic schemas, service, and VendorMaster grid.
- [x] `models/vendor.py` updated — added `gstin` column
- [x] `schemas/vendor.py` updated — added `gstin` to all three schemas
- [x] `services/vendor_service.py` updated — `_model_to_vendor` returns `gstin`; `create_vendor` and `update_vendor` handle it
- [x] `features/vendor/VendorMaster.tsx` updated — GSTIN column added to grid

---

### C4 — E-way bill stored in three places (lrs.eway_bill JSONB + inline fields + eway_bills table)
**Root cause:** `lrs.eway_bill` (JSONB) was the original storage. `eway_bill_no`/`eway_bill_expiry` were added later as inline summary fields. The `eway_bills` table is the authoritative store. The JSONB is populated in API responses by `_attach_eway_bills()` from the eway_bills table — it is not a primary source.
**Fix:** Remove `lrs.eway_bill` JSONB from the ORM model (column stays in DB for safety; migration `20260315_07` schedules deprecation). Update `lr_service.py` to stop writing the JSONB. Keep `eway_bill_no`/`eway_bill_expiry` (used for expiry queries). Update `types/index.ts` to remove the ambiguous `eway_bill` singleton from the LR type.
- [x] `models/lr.py` — removed `eway_bill` JSONB column from ORM model
- [x] `services/lr_service.py` — stop writing `eway_bill=` on LR create/update; set to None in `_to_dict` fallback
- [x] `types/index.ts` — removed `eway_bill?: EWayBill | null` from LR interface
- [x] Migration `20260315_07_deprecate_lr_eway_bill_jsonb.py` created (copies JSONB data to eway_bills then drops column)

---

## HIGH

### H1 — financial_year server defaults hardcoded as '2025-26' (expires April 1, 2026)
**Root cause:** All six tables use `server_default='2025-26'`. New FY starts April 1. Rows inserted without explicit FY (edge paths) will be miscategorised.
**Fix:** Create PostgreSQL function `current_financial_year()`. Update all server defaults to use it via migration `20260315_03`.
- [x] Migration `20260315_03_fix_financial_year_defaults.py` created

---

### H2 — 12 missing FK constraints (no referential integrity enforcement)
**Root cause:** Extensive loose-coupling throughout the schema; FKs intentionally omitted with comments but never added.
**Fix:** Migration `20260315_04` adds FK constraints with `NOT VALID` (skips scan of existing rows; enforces on new inserts). Excludes `lrs.consignor_id`/`consignee_id` (String type — cannot FK to integer PK without data migration; tracked separately as H3).
- [x] Migration `20260315_04_add_missing_fk_constraints.py` created

---

### H3 — lrs.consignor_id / consignee_id typed String(64) instead of Integer FK
**Root cause:** The columns reference `clients.id` (Integer PK) but are declared as `String(64)`. FK cannot be added without a data migration to convert existing string values.
**Fix:** Document as known deferred issue. A follow-up data migration is needed to: (1) verify all values are valid integer strings, (2) cast to Integer, (3) add FK constraint. Not changed in this pass to avoid data loss risk.
- [x] Documented — deferred pending data audit

---

## MEDIUM

### M1 — vehicles.number has no UNIQUE constraint
**Fix:** Migration `20260315_05` adds unique index.
- [x] Migration `20260315_05_add_unique_constraints.py` — vehicles.number unique constraint added

---

### M2 — cities table has no UNIQUE constraint on (name, state)
**Fix:** Migration `20260315_05` adds unique constraint on `(name, state)`.
- [x] Migration `20260315_05_add_unique_constraints.py` — cities (name, state) unique constraint added

---

### M3 — hirememos.hire_memo_no nullable in composite unique constraint
**Root cause:** `uq_hirememos_no_fy` constrains `(hire_memo_no, financial_year)` but `hire_memo_no` is nullable. PostgreSQL treats NULLs as distinct, so multiple NULL rows bypass the constraint.
**Fix:** Documented. The business rule is that draft memos (no number yet) may have NULL. The constraint only protects assigned numbers. No schema change; add application-layer guard in the API to prevent two non-null identical values.
- [x] Documented — behaviour is acceptable; guarded at service layer

---

### M4 — Driver data duplicated across lrs and hirememos
**Root cause:** Both tables store `driver_name`/`driver_mobile`. HireMemo pre-fills from LR on create but then diverges.
**Fix:** Application-layer concern. The hire memo form explicitly copies from the LR on first load (existing behaviour). Adding a DB-level trigger to sync back is out of scope. Documented.
- [x] Documented — accepted denormalization with pre-fill behaviour

---

### M5 — 6 tables missing created_at / updated_at timestamps (contracts, vehicles, users, vendors, cities, templates)
**Fix:** Migration `20260315_06` adds `created_at`/`updated_at` to all six tables. ORM models updated.
- [x] Migration `20260315_06_add_missing_timestamps.py` created
- [x] `models/contract.py` updated
- [x] `models/vehicle.py` updated
- [x] `models/user.py` updated
- [x] `models/vendor.py` updated
- [x] `models/city.py` updated
- [x] `models/template.py` updated

---

### M6 — lrs.created_at / updated_at never auto-populated (no server_default, no onupdate)
**Root cause:** Both columns are `nullable=True` with no `server_default=func.now()` and no `onupdate=func.now()`.
**Fix:** Update `models/lr.py` to add `server_default=func.now()` and `onupdate=func.now()`. Migration not needed (existing data keeps NULL; new rows auto-populate).
- [x] `models/lr.py` updated — `created_at` gets `server_default=func.now()`, `updated_at` gets `onupdate=func.now()`

---

### M7 — Vendor.rating phantom field in frontend types (no DB column)
**Fix:** Remove `rating?: number` from `Vendor` interface in `types/index.ts`.
- [x] `types/index.ts` updated

---

### M8 — LR.dispatch_id phantom field in frontend types (no DB column)
**Fix:** Remove `dispatch_id?: string` from `LR` interface in `types/index.ts` and `lrMappings.ts`.
- [x] `types/index.ts` updated
- [x] `features/operations/lrMappings.ts` updated

---

### M9 — Trip interface fully orphaned (no backend table, model, or API)
**Fix:** Remove `Trip` and `TripStatus` interfaces from `types/index.ts`.
- [x] `types/index.ts` updated

---

### M10 — Client global type missing tds_rate
**Fix:** Add `tds_rate?: number` to the shared `Client` interface in `types/index.ts`.
- [x] `types/index.ts` updated

---

### M11 — vendor_service.update_vendor cannot clear/null a field
**Root cause:** `if val is not None: setattr(r, k, val)` skips null values, making it impossible to clear PAN or mobile.
**Fix:** Use `v.model_dump(exclude_unset=True)` so only fields explicitly sent are updated, and null values are honoured.
- [x] `services/vendor_service.py` updated

---

## LOW

### L1 — eway_bills.valid_upto (Date) and expires_at (DateTime) are redundant
**Root cause:** Two columns represent the same expiry concept at different precision.
**Fix:** Documented. `valid_upto` is the raw e-way bill validity date (from the portal). `expires_at` is a timezone-aware DateTime used for alert scheduling. Both serve different purposes. No change; add column comments.
- [x] Documented — both fields serve distinct purposes

---

### L2 — invoice_lines snapshot data may drift from source LR
**Root cause:** Snapshot fields (`lr_no`, `vehicle_no`, etc.) are captured at invoice time from the LR. If the LR is later amended, the snapshot is stale.
**Fix:** Intentional billing-snapshot pattern. Documented in code comment.
- [x] Documented — accepted snapshot pattern

---

### L3 — vouchers polymorphic reference_type unconstrained
**Fix:** Migration `20260315_04` adds a `CHECK` constraint on `vouchers.reference_type` to the known valid values.
- [x] Included in migration `20260315_04`

---

### L4 — payment_receipts.amount is an alias of net_amount
**Root cause:** The original table had `amount`; the expanded model added `net_amount`. The service sets both to the same value.
**Fix:** The service already keeps them in sync (`row.amount = net_amount`). Document; no schema change to avoid breaking existing queries.
- [x] Documented — synced by service layer

---

---

## ARCH REVIEW GAPS (fixed 2026-03-15)

### GAP-06 — No audit trail for financial mutations (Critical)
**Fix:** Migration `20260315_08` created `audit_log` table. Created `AuditLogModel` and `audit_service.log_action()` helper. Hooked into all financial write operations.
- [x] Migration `20260315_08_add_audit_log.py` created
- [x] `models/audit_log.py` created — `AuditLogModel` maps to `audit_log` table
- [x] `services/audit_service.py` created — `log_action()` helper (never raises, silently logs errors)
- [x] `services/billing_service.py` — `create_invoice`, `update_invoice`, `delete_invoice` log CREATE/UPDATE/DELETE with before/after JSONB snapshots
- [x] `services/payment_receipt_service.py` — `create`, `update`, `delete` log CREATE/UPDATE/DELETE
- [x] `services/lr_service.py` — `create_lr`, `update_lr`, `delete_lr` log CREATE/UPDATE/DELETE
- [x] `services/hirememo_service.py` — `create_hirememo`, `update_hirememo` log CREATE/UPDATE; added `_hm_to_dict()` snapshot helper

---

### GAP-02 — Session-per-function anti-pattern (Critical)
**Fix:** Added `get_db()` generator to `db.py`. Refactored all 15 service files to accept `db: Session` as first param. Updated all 17 API route files to use `Depends(get_db)`. Session lifecycle now owned by FastAPI's DI system.
- [x] `app/db.py` — added `get_db()` generator
- [x] All 15 services refactored (template, user, vehicle, client, vendor, contract, city, voucher, ewaybill, vehicle_location, files, hirememo, payment_receipt, billing, lr)
- [x] All 16 API routes updated (client, vendor, vehicle, contract, user, template, city, hirememo, lr, vehicle_location, ewaybill, billing, payment_receipts, vouchers, files, reports)

### GAP-03 — Missing rollback in payment_receipt_service (Partial)
**Fix:** Added explicit `try/except` with `db.rollback(); raise` in `create`, `update`, and `delete` functions.
- [x] `services/payment_receipt_service.py` updated

### GAP-04 — No global UI error handling
**Fix:** Created `src/lib/toast.ts` (event-bus toast manager) and `src/components/ui/ToastContainer.tsx`. `apiClient` interceptor calls `showToast()` on every error response. `ToastContainer` mounted in `App.tsx`.
- [x] `src/lib/toast.ts` created
- [x] `src/components/ui/ToastContainer.tsx` created
- [x] `src/lib/apiClient.ts` wired to showToast on error
- [x] `src/App.tsx` mounts ToastContainer

### GAP-05 — No shared axios instance
**Fix:** Created `src/lib/apiClient.ts` with configured axios instance (baseURL from env, 30s timeout, error interceptor).
- [x] `src/lib/apiClient.ts` created

### GAP-08 — Service layer mixes DB access and business logic (P1)
**Fix:** Extracted pure financial computation functions into `billing_computations.py`. `billing_service.py` now delegates to pure functions for all financial math.
- [x] `services/billing_computations.py` created — `compute_net_amount()`, `compute_outstanding()`, `derive_payment_status()` (zero DB access, fully unit-testable)
- [x] `services/billing_service.py` — `sync_invoice_payment_status` delegates to `derive_payment_status()`; `create_invoice` uses `compute_net_amount()`

### GAP-11 — Inconsistent form validation on the frontend (P1)
**Fix:** Converted `InvoiceForm` and `HireMemo` from `useState`-only state management to `react-hook-form` + Zod schema validation. Switched from raw `axios` to `apiClient`.
- [x] `features/finance/InvoiceForm.tsx` — Zod schema validates invoice date, client selection, TDS ≥ 0; inline field errors displayed; `apiClient` replaces `axios`
- [x] `features/hirememo/HireMemo.tsx` — Zod schema validates required fields, numeric bounds, and cross-field constraint (advances ≤ total); `reset()` used to hydrate form from API; `apiClient` replaces `axios`

### GAP-13 — Manual Pydantic ↔ TypeScript type synchronisation (P1)
**Fix:** Added `@hey-api/openapi-ts` devDependency and `generate-types` npm script. Run `npm run generate-types` with the backend running to regenerate types from the live OpenAPI schema.
- [x] `package.json` — `@hey-api/openapi-ts ^0.64.0` added to devDependencies
- [x] `package.json` — `generate-types` script: `openapi-ts --input http://localhost:8000/openapi.json --output src/types/generated --client axios`

### GAP-07 — Missing SQLAlchemy relationship declarations
**Fix:** Added `relationship()` to `LRModel` (eway_bills), `EWayBillModel` (lr back-ref), `InvoiceModel` (lines), `InvoiceLineModel` (invoice back-ref). Added ForeignKey to `EWayBillModel.lr_id`.
- [x] `models/lr.py` updated
- [x] `models/ewaybill.py` updated
- [x] `models/invoice.py` updated

### GAP-09 — No Pydantic validators on LR/Invoice schemas
**Fix:** Added `@field_validator` for non-negative amounts and `@model_validator` for date ordering in `schemas/lr.py` and `schemas/invoice.py`.
- [x] `schemas/lr.py` updated
- [x] `schemas/invoice.py` updated

### GAP-10 — No pagination on list endpoints
**Fix:** Added `skip: int = Query(0)` and `limit: int = Query(100)` to LR list and invoice list endpoints. Service functions accept and apply offset/limit.
- [x] `api/lr.py` and `services/lr_service.py` updated
- [x] `api/billing.py` and `services/billing_service.py` updated

### GAP-12 — @tanstack/react-query installed but unwired
**Fix:** Added `QueryClient` + `QueryClientProvider` to `src/main.tsx`.
- [x] `src/main.tsx` updated

### GAP-14 — CORS allow_origins=["*"]
**Fix:** Changed to env-var-driven list via `ALLOWED_ORIGINS` env variable (default: localhost:5173,localhost:3000).
- [x] `app/main.py` updated

### GAP-16 — No cross-reference between amount_in_words.py and amountInWords.ts
**Fix:** Added docstring cross-reference comments in both files.
- [x] `backend/app/core/amount_in_words.py` updated
- [x] `frontend/src/utils/amountInWords.ts` updated

### GAP-17 — Eager imports in App.tsx (no code splitting)
**Fix:** Converted all feature imports to `React.lazy()` with top-level `<Suspense>` fallback.
- [x] `src/App.tsx` updated

### GAP-18 — No 404 route and no ErrorBoundary
**Fix:** Added `path="*"` catch-all `<NotFound>` route. Added `ErrorBoundary` class component wrapping the entire app.
- [x] `src/App.tsx` updated

### GAP-19 — Dual /client/ + /clients/ paths (API naming inconsistency)
**Fix:** Removed singular `/client/` aliases from `client.py` and `contract.py`. Updated `ContractMaster.tsx` to use `/api/contracts/`.
- [x] `api/client.py` — singular alias removed
- [x] `api/contract.py` — singular alias removed
- [x] `features/contract/ContractMaster.tsx` — updated to /api/contracts/

### GAP-20 — PODManagement.tsx is a 3-line passthrough wrapper
**Fix:** Updated `App.tsx` to import and route directly to `PODVerification` instead of the wrapper.
- [x] `src/App.tsx` updated (PODVerification imported directly at /pod route)

---

## DEFERRED (Requires Data Migration)

### D1 — lrs.consignor_id / consignee_id type mismatch (String vs Integer FK)
Requires audit of existing data and a careful type-cast migration. Deferred.

---
