# Task List: CTC-ERP Core (React + FastAPI + PostgreSQL)

## Phase 1: Project Setup
- [ ] T001 [P] Scaffold backend directory structure (backend/app, core, db, models, services, schemas, api, main.py)
- [ ] T002 [P] Scaffold frontend directory structure (src/components, features, layouts, types, utils, api)
- [ ] T003 [P] Set up PostgreSQL and Alembic migrations in backend/db
- [ ] T004 [P] Create docker-compose.yml for local dev orchestration
- [ ] T005 [P] Add root and per-folder README.md files

## Phase 2: Master Data Management
- [ ] T006 [P] Implement Customer/Consignor/Consignee Master CRUD (backend/app/api/party.py, frontend/src/features/party/)
- [ ] T007 [P] Implement Vendor/Supplier/Broker/Driver Master CRUD (backend/app/api/vendor.py, frontend/src/features/vendor/)
- [ ] T008 [P] Implement Vehicle Master CRUD (backend/app/api/vehicle.py, frontend/src/features/vehicle/)
- [ ] T009 [P] Implement Contract Master CRUD with expiry alert config (backend/app/api/contract.py, frontend/src/features/contract/)
- [ ] T010 [P] Implement User Management CRUD (backend/app/api/user.py, frontend/src/features/user/)
- [ ] T011 [P] Implement Document Template Master CRUD (backend/app/api/template.py, frontend/src/features/template/)
- [ ] T012 [P] Implement Tally lock visualization and field-level permissions (frontend/src/features/party/, vendor/, contract/)

## Phase 3: Core Operations
- [ ] T020a Clarify and implement file upload requirements (types: PDF/JPG/PNG, max size: 10MB, validation: client+server) (frontend/src/components/FileUpload.tsx, backend/app/api/files.py)
- [x] T013 Implement Dispatch Register UI (frontend/src/features/operations/DispatchRegister.tsx)
- [x] T014 Implement Create LR (Lorry Receipt) form (frontend/src/features/operations/CreateLR.tsx)
- [ ] T015 Implement Hire Memo creation and management UI (frontend/src/features/hirememo/, backend/app/api/hirememo.py)
- [ ] T016 Implement tracking dashboard and E-way Bill alert UI (frontend/src/features/tracking/, backend/app/api/tracking.py)
- [ ] T017 Implement POD receipt/flagging and digital archive UI (frontend/src/features/pod/, backend/app/api/pod.py)
- [ ] T018 Implement billing/invoice/annexure generation UI (frontend/src/features/billing/, backend/app/api/billing.py)
- [ ] T019 Implement voucher and ledger UI (frontend/src/features/finance/, backend/app/api/finance.py)
- [ ] T020 Implement file upload UI for LR, Invoice, E-way Bill, POD (frontend/src/components/FileUpload.tsx, backend/app/api/files.py)

## Phase 4: Reporting & Audit
- [ ] T021 Implement reporting UI for pending billing (frontend/src/features/reports/, backend/app/api/reports.py)
- [ ] T022 Implement audit trail view (frontend/src/features/audit/, backend/app/api/audit.py)
- [ ] T023 Implement contract expiry dashboard/alerts (frontend/src/features/contract/)

## Phase 5: Security & Access Control
- [ ] T024 Implement JWT-based authentication (backend/app/core/security.py, frontend/src/api/auth.ts)
- [ ] T025 Implement role-based routing and UI controls (frontend/src/routes/, frontend/src/components/ProtectedRoute.tsx)
- [ ] T026 Implement field-level permissions (frontend/src/features/party/, vendor/, contract/)

## Phase 6: Testing & Validation
- [ ] T029a Add explicit end-to-end test scenarios (5-10 full cycles, e.g., LR → Hire Memo → POD → Invoice → Payment)
- [ ] T027 Add unit/integration tests for backend (backend/tests/)
- [ ] T028 Add unit/integration tests for frontend (frontend/tests/)
- [ ] T029 Add end-to-end test scenarios (5-10 full cycles)
- [ ] T030 Add data migration/import scripts using manual register mapping (backend/app/scripts/import_manual.py)

## Phase 7: Documentation & Deployment
- [ ] T031 Write user manual and admin guide (docs/)
- [ ] T032 Write API and data model docs (backend/app/docs/, frontend/docs/)
- [ ] T033 Set up backend deployment (Docker, Gunicorn/Uvicorn)
- [ ] T034 Set up frontend deployment (Vercel/Netlify or Docker)
- [ ] T035 Set up initial manual parallel run support (docs/parallel-run.md)

---

- [P] = Parallelizable
- [x] = Completed

This task list is DRY, modular, and maps directly to your simple, best-practice directory structure. Each task is actionable and references the exact file/folder to be created or updated.
