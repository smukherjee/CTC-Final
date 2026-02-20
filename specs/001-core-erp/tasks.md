# Tasks: CTC-ERP Core (React + FastAPI + PostgreSQL)

**Input**: Design documents from `/specs/001-core-erp/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Create backend folder structure and entry (backend/app, core, db, models, services, schemas, api, main.py)
- [ ] T002 [P] Create frontend folder structure (frontend/src/components, features, layouts, types, utils, api)
- [ ] T003 [P] Add `docker-compose.yml` for local dev orchestration and service definitions (docker-compose.yml)
- [ ] T004 [P] Configure PostgreSQL + Alembic in backend/db (backend/db/alembic.ini, backend/db/env.py)
- [ ] T005 [P] Add developer README and run instructions (specs/001-core-erp/README.md)

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T006 Setup database connection and session provider (backend/db/db.py)
- [ ] T007 [P] Add base models and common utilities (backend/app/models/__init__.py, backend/app/core/utils.py)
- [ ] T008 [P] Configure API routing and register router modules in backend/app/main.py
- [ ] T009 Implement basic error handling and JSON response wrapper (backend/app/core/errors.py)
- [ ] T010 [P] Add environment configuration management (backend/.env.example, backend/app/core/config.py)

---

## Phase 3: User Story 1 - Dispatch Register & LR Creation (Priority: P1) [US1]

**Goal**: Capture dispatch entries, create LR (Lorry Receipt) with goods items, persist to DB and list in Dispatch Register UI.

**Independent Test**: Start backend + frontend, POST `POST /api/lr/` with LR payload and verify `GET /api/lr/` returns created LR; create LR in UI and verify it appears in Dispatch Register grid.

 - [ ] T011 [P] [US1] Create `LR` SQLAlchemy model and migration (backend/app/models/lr.py, backend/alembic/versions/0005_create_lrs.py)
- [ ] T012 [US1] Implement `LRCreate` and `LRResponse` schemas (backend/app/schemas/lr.py)
- [ ] T013 [US1] Implement `lr_service.py` with `create_lr` and `get_all_lrs` (backend/app/services/lr_service.py)
- [ ] T014 [US1] Add LR API router with `GET /api/lr/` and `POST /api/lr/` (backend/app/api/lr.py)
- [ ] T015 [US1] Seed or migrate DB so `lrs` table exists (backend/app/scripts/create_lrs_table.py or `alembic upgrade head`)
- [ ] T016 [US1] Wire `CreateLR` form to call `POST /api/lr/` and map backend response to LR grid row (frontend/src/features/operations/CreateLR.tsx)
- [ ] T017 [US1] Load persisted LRs into `DispatchRegister` on mount (`GET /api/lr/`) and fallback to existing mocks if empty (frontend/src/features/operations/DispatchRegister.tsx)
- [ ] T018 [US1] Add basic frontend validation and submitting state for CreateLR (frontend/src/features/operations/CreateLR.tsx)

---

## Phase 4: User Story 2 - Hire Memo (Priority: P1) [US2]

**Goal**: Create and manage Hire Memos linked to LRs with advance/payment capture.

**Independent Test**: POST `POST /api/hirememo/` with required fields and verify `GET /api/hirememo/` returns that memo and it links to an LR id.

 - [ ] T019 [P] [US2] Create `HireMemo` SQLAlchemy model and migration (backend/app/models/hirememo.py, backend/alembic/versions/0004_create_hirememos.py)
- [ ] T020 [US2] Implement `HireMemo` schemas (backend/app/schemas/hirememo.py)
- [ ] T021 [US2] Implement `hirememo_service.py` (advances calculation and LR linking) (backend/app/services/hirememo_service.py)
- [ ] T022 [US2] Add Hire Memo API router with create/list endpoints (backend/app/api/hirememo.py)
- [ ] T023 [US2] Implement Hire Memo UI to create/edit memos and link to LRs (frontend/src/features/hirememo/)

---

## Phase 5: User Story 3 - Master Data: City & Vendor (Priority: P1) [US3]

**Goal**: Provide city and vendor masters for dropdowns used by CreateLR and DispatchRegister.

**Independent Test**: `GET /api/city/` returns seeded list; CreateLR origin/destination/through dropdowns load these lists.

 - [ ] T024 [P] [US3] Implement `City` model, migration and API (backend/app/models/city.py, backend/alembic/versions/000X_create_cities.py, backend/app/api/city.py)
- [ ] T025 [P] [US3] Create idempotent cities seed script (backend/app/scripts/seed_cities.py)
- [ ] T026 [P] [US3] Implement Vendor model/api if not present (backend/app/models/vendor.py, backend/app/api/vendor.py)
- [ ] T027 [US3] Wire CreateLR origin/destination/fob selects to `GET /api/city/` (frontend/src/features/operations/CreateLR.tsx)
- [ ] T028 [US3] Wire CreateLR `through` select to `GET /api/vendor/` and store `through_id` on save (frontend/src/features/operations/CreateLR.tsx, frontend/src/types/index.ts)

---

## Phase 6: User Story 4 - File Uploads & POD (Priority: P1) [US4]

**Goal**: Support file uploads for LR, Invoice, E-way Bill, and POD and flag POD receipt on LR records.

**Independent Test**: Upload files via API and verify stored metadata and LR record shows POD flagged.

- [ ] T029 [P] [US4] Implement file storage API endpoints and validation (backend/app/api/files.py)
- [ ] T030 [US4] Implement server-side file retention policy and storage service (backend/app/services/files_service.py)
- [ ] T031 [US4] Add frontend `FileUpload` component and integrate into CreateLR/HireMemo UI (frontend/src/components/FileUpload.tsx)
- [ ] T032 [US4] Add POD flagging and search in DispatchRegister UI (frontend/src/features/operations/DispatchRegister.tsx)

---

## Phase 7: User Story 5 - Tracking & Alerts (Priority: P1) [US5]

**Goal**: Capture daily vehicle status logs and send E-way Bill pre-expiry alerts.

**Independent Test**: Submit a tracking log and verify alert scheduling triggers (manual simulation acceptable for MVP).

- [ ] T033 [P] [US5] Create `Tracking` model and migration (backend/app/models/tracking.py)
- [ ] T034 [US5] Implement tracking service and alert scheduler (backend/app/services/tracking_service.py)
- [ ] T035 [US5] Add tracking API endpoints and UI dashboard (backend/app/api/tracking.py, frontend/src/features/tracking/)

---

## Phase 8: User Story 6 - Billing & Annexure (Priority: P2) [US6]

**Goal**: Batch-select LRs to generate invoices and annexures (PDF) with variable charges.

**Independent Test**: Select multiple LRs via API/UI and generate an invoice PDF file with annexure listing.

- [ ] T036 [US6] Implement billing service and PDF annexure generator (backend/app/services/billing_service.py)
- [ ] T037 [US6] Implement billing API for batch LR selection and invoice generation (backend/app/api/billing.py)
- [ ] T038 [US6] Implement frontend billing UI for batch selection and PDF download (frontend/src/features/billing/)

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T039 [P] Documentation updates and runbook in docs/ (docs/parallel-run.md, docs/user-manual.md)
- [ ] T040 [P] Add unit and integration tests for core flows (backend/tests/, frontend/tests/)
- [ ] T041 [P] Implement JWT auth and role-based routing (backend/app/core/security.py, frontend/src/api/auth.ts)
- [ ] T042 [P] Code cleanup and small UX polish tasks (various files)

---

## Dependencies & Execution Order

- Setup (Phase 1) -> Foundational (Phase 2) -> All User Stories (Phase 3+)
- Apply DB migrations (T015/T019/T024/T033) before running story APIs that require those tables
- Recommended MVP: Complete **User Story 1 (Dispatch Register & LR Creation)** first, validate end-to-end, then add Hire Memo and Masters.

## Parallel Execution Examples

- Multiple developers can work simultaneously:
  - Dev A: `LR` model, service, API (T011-T014)
  - Dev B: CreateLR UI and DispatchRegister wiring (T016-T017)
  - Dev C: City/Vendor masters and seed scripts (T024-T028)

## Implementation Strategy

- MVP First: Finish Phase 1 + Phase 2 + **US1**. Stop and validate. Then add US2 and US3 in parallel.
- Incremental: Each story contains models → services → API → UI tasks so each can be validated independently.

---

## Files Created/Edited (examples referenced in tasks above)

- backend/app/models/*.py
- backend/app/schemas/*.py
- backend/app/services/*.py
- backend/app/api/*.py
- backend/alembic/versions/*.py
- backend/app/scripts/seed_cities.py
- frontend/src/features/operations/CreateLR.tsx
- frontend/src/features/operations/DispatchRegister.tsx
- frontend/src/features/hirememo/
- frontend/src/components/FileUpload.tsx

---

Generated from plan.md and spec.md in `/specs/001-core-erp/`.
