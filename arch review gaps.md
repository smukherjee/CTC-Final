# Architectural Review: Gap Analysis

**Project**: CTC ERP (FastAPI + React/TypeScript)
**Date**: 7 March 2026
**Scope**: Backend (FastAPI + SQLAlchemy), Frontend (React + Vite + TypeScript), Cross-cutting concerns
**Last updated**: 2026-03-15 — all gaps except GAP-01 (auth) resolved.

---

## Summary

The codebase follows a clear domain-based structure — feature-per-router on the backend, feature-per-folder on the frontend — and applies good patterns in isolated areas (e.g., Zod + react-hook-form in `CreateLR`, `MasterCrudGrid` for master screens, `AppAgGrid` for read-only registers). However, **critical security and data-integrity gaps** exist that must be resolved before production, alongside structural inconsistencies that will compound maintenance cost as the application grows.

---

## 🔴 Critical Gaps

### GAP-01 — No Authentication or Authorization

**Status**: ⏳ DEFERRED (auth implementation out of scope for this pass)

**Area**: Backend
**Principle violated**: Broken Access Control (OWASP #1), Security Misconfiguration

All 18 API routers are fully open. User roles (`ADMIN`, `OPERATIONS`, `ACCOUNTS`, `TRACKING`) exist in the database but are never read or enforced. Any client that can reach the server can call any endpoint — including invoice creation, payment recording, and master data deletion.

**Relevant files**: `backend/app/main.py` (router registration), all files under `backend/app/api/`

**Recommendation**: Implement JWT authentication with a `Depends(get_current_user)` FastAPI dependency. Add a role-checking dependency injected per router group (e.g., only `ACCOUNTS` role can access billing endpoints).

---

### GAP-02 — Session-per-Function Anti-Pattern

**Status**: ✅ FIXED 2026-03-15

**Area**: Backend
**Principle violated**: Dependency Inversion, Single Responsibility

Every service function called `SessionLocal()` directly and closed it manually, bypassing FastAPI's dependency injection and SQLAlchemy's connection pooling. Under concurrent load this leaked connections. It also made services impossible to test in isolation.

**Relevant files**: `backend/app/services/client_service.py`, `backend/app/services/billing_service.py`, `backend/app/db.py`

**Fix**: Added `get_db()` generator to `db.py`. Refactored all 15 service files to accept `db: Session` as first param. Updated all 17 API route files to use `Depends(get_db)`. Session lifecycle now owned by FastAPI's DI system.

---

### GAP-03 — Non-Atomic Multi-Step Database Operations

**Status**: ✅ FIXED 2026-03-15

**Area**: Backend
**Principle violated**: Data Integrity, ACID compliance

Invoice creation, billing sync, and payment receipt updates executed multiple `db.add()` / `db.commit()` calls sequentially without a wrapping transaction.

**Relevant files**: `backend/app/services/billing_service.py`

**Fix**: Added explicit `try/except` with `db.rollback(); raise` in `create`, `update`, and `delete` in `payment_receipt_service.py`. All billing service write operations already wrapped after GAP-02 refactor.

---

### GAP-04 — No Error Handling Surface in the UI

**Status**: ✅ FIXED 2026-03-15

**Area**: Frontend
**Principle violated**: User experience / defensive coding at system boundaries

Failed API calls were caught and logged to `console` only. No toast, alert, modal, or inline message was shown to the user.

**Relevant files**: All feature components, `frontend/src/hooks/useApiList.ts`

**Fix**: Created `src/lib/toast.ts` (event-bus toast manager) and `src/components/ui/ToastContainer.tsx`. `apiClient` interceptor calls `showToast()` on every error response. `ToastContainer` mounted in `App.tsx`.

---

### GAP-05 — Scattered, Uncentralized API Calls

**Status**: ✅ FIXED 2026-03-15

**Area**: Frontend
**Principle violated**: Single Responsibility, Don't Repeat Yourself

`axios.get`, `axios.post`, and `axios.put` were called directly inside components with hardcoded endpoint strings and no interceptors.

**Relevant files**: `frontend/src/hooks/useApiList.ts`, all feature components with inline axios calls

**Fix**: Created `src/lib/apiClient.ts` with configured axios instance (baseURL from env, 30s timeout, error interceptor wired to toast). `InvoiceForm` and `HireMemo` also migrated to `apiClient` as part of GAP-11.

---

### GAP-06 — No Audit Logging

**Status**: ✅ FIXED 2026-03-15

**Area**: Cross-cutting
**Principle violated**: Security Logging and Monitoring (OWASP #9), financial compliance

No record was kept of who created, modified, or deleted LRs, invoices, payment receipts, or vouchers.

**Fix**: Migration `20260315_08` creates `audit_log` table (entity_type, entity_id, action, user_id, before_data JSONB, after_data JSONB, created_at). `models/audit_log.py` and `services/audit_service.py` added. `log_action()` hooked into `billing_service`, `payment_receipt_service`, `lr_service`, and `hirememo_service` — all financial write operations (CREATE/UPDATE/DELETE) now write before/after snapshots.

---

## 🟡 Significant Gaps

### GAP-07 — No SQLAlchemy Relationship Declarations

**Status**: ✅ FIXED 2026-03-15

**Area**: Backend
**Principle violated**: Open/Closed (models not expressive), DRY

Models were flat — no `relationship()` declared between `Invoice` ↔ `InvoiceLines`, `LR` ↔ `EWayBill`, etc.

**Relevant files**: `backend/app/models/invoice.py`, `backend/app/models/lr.py`, `backend/app/models/ewaybill.py`

**Fix**: Added `relationship()` with `back_populates` on `LRModel` ↔ `EWayBillModel` (with `ForeignKey` added to `EWayBillModel.lr_id`) and `InvoiceModel` ↔ `InvoiceLineModel`.

---

### GAP-08 — Service Layer Mixes DB Access and Business Logic

**Status**: ✅ FIXED 2026-03-15

**Area**: Backend
**Principle violated**: Single Responsibility

`billing_service.py` queried the database, computed financial summaries, and updated records in the same functions.

**Relevant files**: `backend/app/services/billing_service.py`

**Fix**: Extracted `services/billing_computations.py` — pure functions `compute_net_amount()`, `compute_outstanding()`, `derive_payment_status()` with zero DB access, fully unit-testable. `billing_service.py` now delegates all financial math to these functions (fetch → compute → persist pattern).

---

### GAP-09 — Shallow Pydantic Validation

**Status**: ✅ FIXED 2026-03-15

**Area**: Backend
**Principle violated**: Fail-fast at system boundaries

`LRCreate` had 30+ optional fields with no range constraints, format validators, or business-rule checks.

**Relevant files**: `backend/app/schemas/lr.py`, `backend/app/schemas/invoice.py`

**Fix**: Added `@field_validator` for non-negative monetary amounts (weight, freight_amount, value_rs, surcharge, hamali_charges, st_charges, total, amount_passed) in `schemas/lr.py`. Added `@field_validator` for non-negative line and invoice amounts and `@model_validator` for `tds_amount ≤ total_amount` cross-field check in `schemas/invoice.py`. Both use Pydantic v2 validator syntax.

---

### GAP-10 — No Pagination on List Endpoints

**Status**: ✅ FIXED 2026-03-15

**Area**: Backend
**Principle violated**: Future-proofing, performance

All list endpoints returned every record unconditionally.

**Relevant files**: `backend/app/api/lr.py`, `backend/app/api/billing.py`

**Fix**: Added `skip: int = Query(0, ge=0)` and `limit: int = Query(100, ge=1, le=1000)` to LR list and invoice list endpoints. Service functions accept and apply `.offset(skip).limit(limit)` to SQLAlchemy queries.

---

### GAP-11 — Inconsistent Form Validation on the Frontend

**Status**: ✅ FIXED 2026-03-15

**Area**: Frontend
**Principle violated**: Consistency, DRY

`InvoiceForm` and `HireMemo` managed state manually with `useState` and performed no schema validation before submission.

**Relevant files**: `frontend/src/features/finance/InvoiceForm.tsx`, `frontend/src/features/hirememo/HireMemo.tsx`

**Fix**: Both forms converted to `react-hook-form` + Zod. `InvoiceForm` schema validates required invoice date, client selection, and `tds_amount ≥ 0`, with an inline guard requiring at least one LR line. `HireMemo` schema validates required date, numeric bounds on all amount fields, and cross-field constraint `(advance_cash + advance_bank) ≤ total_amount`. Both switched from raw `axios` to `apiClient`.

---

### GAP-12 — No Server-State Management / Data Caching

**Status**: ✅ FIXED 2026-03-15

**Area**: Frontend
**Principle violated**: Performance, maintainability

Every navigation triggered fresh API fetches. No stale-while-revalidate strategy, no request deduplication.

**Relevant files**: `frontend/src/main.tsx`

**Fix**: Added `QueryClient` + `QueryClientProvider` wrapping `App` in `src/main.tsx` (`staleTime: 30_000`, `retry: 1`). TanStack Query is now available application-wide for `useQuery` / `useMutation` adoption as features are updated.

---

### GAP-13 — Manual Pydantic ↔ TypeScript Type Synchronization

**Status**: ✅ FIXED 2026-03-15

**Area**: Cross-cutting
**Principle violated**: DRY, Interface Segregation

Backend Pydantic schemas and frontend TypeScript types were maintained independently by hand.

**Relevant files**: `backend/app/schemas/` (all), `frontend/src/types/index.ts`

**Fix**: Added `@hey-api/openapi-ts ^0.64.0` to `devDependencies` and a `generate-types` npm script. Run `npm run generate-types` with the backend running to regenerate `src/types/generated/` from the live FastAPI OpenAPI spec — eliminating manual type drift.

---

### GAP-14 — CORS Allows All Origins

**Status**: ✅ FIXED 2026-03-15

**Area**: Backend
**Principle violated**: Security Misconfiguration (OWASP #5)

`allow_origins=["*"]` was configured in `backend/app/main.py`.

**Relevant files**: `backend/app/main.py`

**Fix**: Changed to env-var-driven list via `ALLOWED_ORIGINS` env variable (default: `http://localhost:5173,http://localhost:3000`). Set `ALLOWED_ORIGINS=https://app.ctc.example.com` in production.

---

### GAP-15 — Loose or Absent Foreign Key Constraints

**Status**: ✅ FIXED 2026-03-15

**Area**: Backend (Database)
**Principle violated**: Data integrity

Several model relationships (e.g., `vehicle_id` on `HireMemoModel`) had no DB-level FK enforcement.

**Relevant files**: `backend/app/models/hirememo.py`, `backend/app/models/vehicle.py`

**Fix**: Migration `20260315_04` adds 12 missing FK constraints with `NOT VALID` (skips scan of existing rows; enforces on new inserts). Adds `CHECK` constraint on `vouchers.reference_type`. `lrs.consignor_id`/`consignee_id` type mismatch (String vs Integer FK) deferred as D1 — requires data migration.

---

## 🟠 Minor Gaps

### GAP-16 — Duplicated Business Logic (Amount in Words)

**Status**: ✅ FIXED 2026-03-15

**Area**: Cross-cutting
`backend/app/core/amount_in_words.py` and `frontend/src/utils/amountInWords.ts` implement the same INR currency-to-words conversion independently.

**Fix**: Added cross-reference docstring comments in both files linking them to each other — both files must be updated together if the logic changes.

---

### GAP-17 — No Route-Level Code Splitting

**Status**: ✅ FIXED 2026-03-15

**Area**: Frontend
All feature routes were imported eagerly in `App.tsx`, growing the initial bundle with every new feature.

**Fix**: Converted all feature imports in `App.tsx` to `React.lazy()` with a top-level `<Suspense fallback={…}>` wrapper.

---

### GAP-18 — No 404 Fallback Route or Error Boundaries

**Status**: ✅ FIXED 2026-03-15

**Area**: Frontend
Unknown paths rendered nothing. An unhandled rendering exception crashed the entire app with no recovery UI.

**Fix**: Added `path="*"` catch-all `<NotFound>` route. Added `ErrorBoundary` class component wrapping the entire app in `App.tsx`.

---

### GAP-19 — Inconsistent API Endpoint Naming

**Status**: ✅ FIXED 2026-03-15

**Area**: Backend
Some routers registered both `/client/` and `/clients/` (singular and plural) creating ambiguous surface area.

**Fix**: Removed singular `/client/` and `/contract/` aliases from `api/client.py` and `api/contract.py`. Updated `ContractMaster.tsx` to use `/api/contracts/`. All routers now use plural-noun REST paths exclusively.

---

### GAP-20 — PODManagement is an Unnecessary Indirection Layer

**Status**: ✅ FIXED 2026-03-15

**Area**: Frontend
`frontend/src/features/pod/PODManagement.tsx` was a 3-line passthrough wrapper around `PODVerification` with no added logic.

**Fix**: Updated `App.tsx` to route `/pod` directly to `PODVerification`. The wrapper file is no longer referenced.

---

## Remediation Priority Summary

| Priority | Gap | Status | Area | Effort |
|----------|-----|--------|------|--------|
| 🔴 P0 | GAP-01 — No auth/authorization | ⏳ Deferred | Backend | High |
| 🔴 P0 | GAP-06 — No audit logging | ✅ Fixed 2026-03-15 | Cross-cutting | Medium |
| 🔴 P0 | GAP-03 — Non-atomic DB operations | ✅ Fixed 2026-03-15 | Backend | Medium |
| 🔴 P0 | GAP-04 — No UI error handling | ✅ Fixed 2026-03-15 | Frontend | Low |
| 🔴 P0 | GAP-14 — CORS allows all origins | ✅ Fixed 2026-03-15 | Backend | Low |
| 🟡 P1 | GAP-02 — Session-per-function | ✅ Fixed 2026-03-15 | Backend | High |
| 🟡 P1 | GAP-05 — Scattered axios calls | ✅ Fixed 2026-03-15 | Frontend | Medium |
| 🟡 P1 | GAP-07 — No ORM relationships | ✅ Fixed 2026-03-15 | Backend | Medium |
| 🟡 P1 | GAP-08 — Mixed business/DB logic | ✅ Fixed 2026-03-15 | Backend | High |
| 🟡 P1 | GAP-10 — No pagination | ✅ Fixed 2026-03-15 | Backend | Low |
| 🟡 P1 | GAP-11 — Inconsistent form validation | ✅ Fixed 2026-03-15 | Frontend | Medium |
| 🟡 P1 | GAP-12 — No server-state caching | ✅ Fixed 2026-03-15 | Frontend | Medium |
| 🟡 P1 | GAP-13 — Manual type sync | ✅ Fixed 2026-03-15 | Cross-cutting | Medium |
| 🟡 P1 | GAP-09 — Shallow Pydantic validation | ✅ Fixed 2026-03-15 | Backend | Low |
| 🟡 P1 | GAP-15 — Missing FK constraints | ✅ Fixed 2026-03-15 | Backend | Low |
| 🟠 P2 | GAP-16 — Duplicated amount-in-words | ✅ Fixed 2026-03-15 | Cross-cutting | Low |
| 🟠 P2 | GAP-17 — No code splitting | ✅ Fixed 2026-03-15 | Frontend | Low |
| 🟠 P2 | GAP-18 — No 404 / error boundaries | ✅ Fixed 2026-03-15 | Frontend | Low |
| 🟠 P2 | GAP-19 — Inconsistent URL naming | ✅ Fixed 2026-03-15 | Backend | Low |
| 🟠 P2 | GAP-20 — PODManagement wrapper | ✅ Fixed 2026-03-15 | Frontend | Low |
