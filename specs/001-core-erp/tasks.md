# Tasks: CTC-ERP Core (001-core-erp)

**Input**: Design documents from `specs/001-core-erp/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: No separate test-first track is included because explicit TDD/test-task requirement is not requested in the feature specification.

**Organization**: Tasks are grouped by user story for independent implementation and validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align shared app scaffolding, routing, and report shell conventions.

- [X] T001 Confirm backend router registration points in `backend/app/main.py`
- [X] T002 Confirm frontend route shell and menu integration points in `frontend/src/App.tsx`
- [X] T003 [P] Add/refresh FY helper utilities in `backend/app/core/financial_year_utils.py`
- [X] T004 [P] Add/refresh FY helper utilities in `frontend/src/utils/financialYear.ts`
- [X] T005 [P] Add shared report query client helpers in `frontend/src/lib/api.ts`
- [X] T006 Add report tab container shell in `frontend/src/features/reports/Reports.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core data/API/report foundations required before user stories.

**CRITICAL**: User story work starts only after this phase is complete.

- [X] T007 Add `financial_year` enforcement guards for register entities in `backend/app/core/financial_year_utils.py`
- [X] T008 Add FY/index constraints migration checks in `backend/alembic/versions/`
- [X] T009 Add reusable report filter parsing (fy/date/entity/role) in `backend/app/services/reports_service.py`
- [X] T010 [P] Add reusable report pagination/sorting helpers in `backend/app/api/reports.py`
- [X] T011 [P] Add report DTO builders for money/ageing aggregates in `backend/app/services/reports_service.py`
- [X] T012 Add role guard checks for finance and reporting endpoints in `backend/app/api/reports.py`
- [X] T013 [P] Add shared report response typings in `frontend/src/types/reports.ts`
- [X] T014 Align reporting contract coverage baseline in `specs/001-core-erp/contracts/reports.yaml`

**Checkpoint**: Foundation complete, user story implementation can proceed.

---

## Phase 3: User Story 1 - Centralized Dispatch Register (Priority: P1) 🎯 MVP

**Goal**: Capture complete LR details with deduction rows, FY scoping, and inline e-way updates.

**Independent Test**: Create and update LR records with deductions, verify totals/FY filtering, and confirm dispatch grid edits work.

- [X] T015 [US1] Add LR deduction create/update service logic in `backend/app/services/lr_service.py`
- [X] T016 [US1] Add LR total recomputation from deduction rows in `backend/app/services/lr_service.py`
- [X] T017 [US1] Update LR API schemas for deduction list payloads in `backend/app/schemas/lr.py`
- [X] T018 [US1] Expose FY query filter in LR list endpoint in `backend/app/api/lr.py`
- [X] T019 [US1] Add inline e-way update handling in LR API in `backend/app/api/lr.py`
- [X] T020 [US1] Render `driver_mobile` grid column in `frontend/src/features/operations/DispatchRegister.tsx`
- [X] T021 [US1] Implement inline e-way number/expiry editing UI in `frontend/src/features/operations/DispatchRegister.tsx`
- [X] T022 [US1] Add FY dropdown and query wiring in `frontend/src/features/operations/DispatchRegister.tsx`
- [X] T023 [US1] Add LR deduction input rows in LR form in `frontend/src/features/operations/CreateLR.tsx`

---

## Phase 4: User Story 2 - Hire Memo Management (Priority: P2)

**Goal**: Provide FY-sequenced Hire Memo lifecycle, balance computation, and two-copy print.

**Independent Test**: Create Hire Memo from LR, verify FY sequence uniqueness, computed balance, and two-copy printable layout.

- [X] T024 [US2] Implement FY sequence number allocation for Hire Memo in `backend/app/services/hirememo_service.py`
- [X] T025 [US2] Add uniqueness guard for `(financial_year, hire_memo_no)` in `backend/app/services/hirememo_service.py`
- [X] T026 [US2] Add FY query filtering in Hire Memo API list endpoint in `backend/app/api/hirememo.py`
- [X] T027 [US2] Add/confirm Hire Memo register route in `frontend/src/App.tsx`
- [X] T028 [US2] Build FY-filtered Hire Memo register UI in `frontend/src/features/hirememo/HireMemoRegister.tsx`
- [X] T029 [US2] Add amount-in-words rendering in `frontend/src/utils/printHireMemo.ts`
- [X] T030 [US2] Update two-copy print layout in `frontend/src/templates/hirememo-template.hbs`

---

## Phase 5: User Story 3 - Real-Time Tracking & E-way Alerts (Priority: P3)

**Goal**: Capture daily location updates and show 8-hour pre-expiry e-way alerts.

**Independent Test**: Record tracking updates and verify pre-expiry alert visibility for undelivered LRs.

- [X] T031 [US3] Implement 8-hour e-way alert query logic in `backend/app/services/reports_service.py`
- [X] T032 [US3] Expose e-way alert endpoint in `backend/app/api/reports.py`
- [X] T033 [US3] Implement daily location update endpoint in `backend/app/api/vehicle_location.py`
- [ ] T034 [US3] Render e-way alert banner/modal in `frontend/src/pages/Dashboard.tsx`
- [X] T035 [US3] Add daily tracking update flow in `frontend/src/features/operations/TrackingLog.tsx`

---

## Phase 6: User Story 4 - POD Management (Priority: P4)

**Goal**: Manage POD status updates, archive/search POD files, and expose POD readiness data.

**Independent Test**: Upload POD, update POD status, and retrieve POD records by LR/vehicle filters.

- [X] T036 [US4] Add POD status update API handling in `backend/app/api/lr.py`
- [X] T037 [US4] Implement POD file metadata persistence in `backend/app/services/storage_service.py`
- [X] T038 [US4] Add POD search filters in reports API in `backend/app/api/reports.py`
- [X] T039 [US4] Build POD management screen with upload controls in `frontend/src/features/operations/PODManagement.tsx`
- [X] T040 [US4] Add POD search and preview table in `frontend/src/features/operations/PODManagement.tsx`

---

## Phase 7: User Story 5 - Billing & Invoice Register (Priority: P1)

**Goal**: Generate FY-sequenced invoices from LR totals, compute net correctly, and support print payloads.

**Independent Test**: Create invoice from LR set, verify LR-total billing basis, TDS net derivation, and printable payload with deduction lines.

- [X] T041 [US5] Implement invoice FY sequence generator in `backend/app/services/billing_service.py`
- [X] T042 [US5] Enforce LR `total` as invoice line amount source in `backend/app/services/billing_service.py`
- [X] T043 [US5] Remove/reject invoice charge recomposition payload fields in `backend/app/schemas/invoice.py`
- [X] T044 [US5] Compute invoice `net_amount` from gross minus header `tds_amount` in `backend/app/services/billing_service.py`
- [X] T045 [US5] Add invoice print payload endpoint with LR deduction lines in `backend/app/api/billing.py`
- [X] T046 [US5] Implement per-client and FY invoice register filters in `backend/app/api/billing.py`
- [X] T047 [US5] Add invoice outstanding projection logic in `backend/app/services/billing_service.py`
- [X] T048 [US5] Update invoice form to use LR-total line values in `frontend/src/features/finance/InvoiceForm.tsx`
- [X] T049 [US5] Add per-client tabs and outstanding summary in `frontend/src/features/finance/BillBook.tsx`
- [X] T050 [US5] Add FY dropdown filtering in invoice register UI in `frontend/src/features/finance/BillBook.tsx`
- [X] T051 [US5] Add invoice template deduction `LESS` lines in `frontend/src/templates/invoice-template.hbs`
- [X] T052 [US5] Wire print mapper/trigger flow in `frontend/src/utils/printInvoice.ts`
- [X] T053 [US5] Add invoice create/edit route navigation wiring in `frontend/src/App.tsx`

---

## Phase 8: User Story 6 - Payment Receipts Register (Priority: P1)

**Goal**: Capture FY-scoped receipt events independent of commercial deduction accounting.

**Independent Test**: Create/list payment receipts with FY filter and verify no deduction fields are present.

- [X] T054 [US6] Keep receipt-event-only schema fields in `backend/app/schemas/payment_receipt.py`
- [X] T055 [US6] Enforce no commercial deduction fields in receipt service in `backend/app/services/payment_receipt_service.py`
- [X] T056 [US6] Add FY filter handling in payment receipt API in `backend/app/api/payment_receipts.py`
- [X] T057 [US6] Build payment receipt register screen in `frontend/src/features/finance/PaymentReceiptsRegister.tsx`
- [X] T058 [US6] Add FY dropdown/query wiring in `frontend/src/features/finance/PaymentReceiptsRegister.tsx`
- [X] T059 [US6] Add payment receipt route and menu link in `frontend/src/App.tsx`

---

## Phase 9: User Story 7 - Voucher & Ledger Automation (Priority: P2)

**Goal**: Auto-generate vouchers from financial events and maintain ledger projections.

**Independent Test**: Create hire memo advances and verify voucher and ledger rows with correct debit/credit running balances.

- [X] T060 [US7] Ensure hire memo advance voucher generation in `backend/app/services/voucher_service.py`
- [X] T061 [US7] Add FY filter support in voucher list API in `backend/app/api/vouchers.py`
- [X] T062 [US7] Add ledger running balance computations in `backend/app/services/ledger_service.py`
- [X] T063 [US7] Add FY controls in ledger UI in `frontend/src/features/finance/LedgerBook.tsx`
- [X] T064 [US7] Add voucher print template shell in `frontend/src/templates/voucher-template.hbs`

---

## Phase 10: User Story 8 - Master Data Management (Priority: P2)

**Goal**: Keep client/vendor/contract masters aligned with operational and billing rules.

**Independent Test**: Manage master records with vendor GSTIN exclusion and valid selector bindings.

- [X] T065 [US8] Remove vendor `gstin` from model/schema in `backend/app/models/vendor.py`
- [X] T066 [US8] Add migration for vendor GSTIN removal in `backend/alembic/versions/`
- [X] T067 [US8] Reject GSTIN payload in vendor API in `backend/app/api/vendor.py`
- [X] T068 [US8] Remove GSTIN field from vendor UI in `frontend/src/features/vendor/VendorMaster.tsx`
- [X] T069 [US8] Ensure FOB client master binding in LR form selectors in `frontend/src/features/operations/CreateLR.tsx`

---

## Phase 11: User Story 9 - Security & Access Control (Priority: P2)

**Goal**: Enforce role-based permissions with finance access restricted to authorized users.

**Independent Test**: Non-finance roles cannot execute billing/receipt/voucher/report actions while Accounts/Admin can.

- [X] T070 [US9] Add role claims handling in auth service in `backend/app/services/auth_service.py`
- [X] T071 [US9] Add route-level role guards for billing APIs in `backend/app/api/billing.py`
- [X] T072 [US9] Add role guards for payment/voucher/report APIs in `backend/app/api/payment_receipts.py`
- [X] T073 [US9] Add frontend route guard for finance paths in `frontend/src/layouts/AppLayout.tsx`
- [X] T074 [US9] Hide finance navigation by role in `frontend/src/components/Sidebar.tsx`

---

## Phase 12: User Story 10 - Reporting (Priority: P2)

**Goal**: Deliver active FR10 reporting scope with FY filters, role-aware visibility, and export support.

**Independent Test**: Generate each FR10 report and verify row-level accuracy and aggregate consistency against source transactions.

- [X] T075 [US10] Implement pending billing and outstanding receivables queries in `backend/app/services/reports_service.py`
- [X] T076 [US10] Implement hire memo register and advance payment register queries in `backend/app/services/reports_service.py`
- [X] T077 [US10] Implement driver settlement and driver outstanding queries in `backend/app/services/reports_service.py`
- [X] T078 [US10] Implement vendor spend and settlement variance queries in `backend/app/services/reports_service.py`
- [X] T079 [US10] Implement advance aging and cash advance utilization queries in `backend/app/services/reports_service.py`
- [X] T080 [US10] Implement hire memo print trace and trip profitability queries in `backend/app/services/reports_service.py`
- [X] T081 [US10] Implement per-vehicle cost and per-driver performance queries in `backend/app/services/reports_service.py`
- [X] T082 [US10] Implement POD status/worklist, e-way alert, and receivables aging queries in `backend/app/services/reports_service.py`
- [X] T083 [US10] Implement audit log and contract expiry report queries in `backend/app/services/reports_service.py`
- [X] T084 [US10] Implement debit voucher register, bank book, and cash book queries in `backend/app/services/reports_service.py`
- [X] T085 [US10] Expose report endpoints for pending/outstanding/hire/advance in `backend/app/api/reports.py`
- [X] T086 [US10] Expose report endpoints for driver/vendor/variance/aging in `backend/app/api/reports.py`
- [X] T087 [US10] Expose report endpoints for profitability/print/POD/e-way/receivables aging in `backend/app/api/reports.py`
- [X] T088 [US10] Expose report endpoints for audit/contract/voucher/bank/cash books in `backend/app/api/reports.py`
- [X] T089 [US10] Build pending billing and outstanding receivables report views in `frontend/src/features/reports/`
- [X] T090 [US10] Build hire memo register and advance payment report views in `frontend/src/features/reports/`
- [X] T091 [US10] Build driver settlement and driver outstanding report views in `frontend/src/features/reports/`
- [X] T092 [US10] Build vendor spend and settlement variance report views in `frontend/src/features/reports/`
- [X] T093 [US10] Build advance aging and cash utilization report views in `frontend/src/features/reports/`
- [X] T094 [US10] Build print trace and trip profitability report views in `frontend/src/features/reports/`
- [X] T095 [US10] Build per-vehicle cost and per-driver performance report views in `frontend/src/features/reports/`
- [X] T096 [US10] Build POD status/worklist and e-way alert report views in `frontend/src/features/reports/`
- [X] T097 [US10] Build receivables aging, audit log, and contract expiry report views in `frontend/src/features/reports/`
- [X] T098 [US10] Build debit voucher register, bank book, and cash book report views in `frontend/src/features/reports/`
- [X] T099 [US10] Add shared filter shell and tab routing for FR10 reports in `frontend/src/features/reports/Reports.tsx`
- [X] T100 [US10] Add CSV export actions for all FR10 report views in `frontend/src/features/reports/`
- [X] T101 [US10] Align OpenAPI report contracts with implemented endpoints in `specs/001-core-erp/contracts/reports.yaml`

---

## Phase 13: User Story 11 - Deployment & Transition (Priority: P3)

**Goal**: Support deployment and manual-parallel transition runbook.

**Independent Test**: Execute go-live checklist and parallel run verification steps successfully.

- [X] T102 [US11] Update deployment steps for backend/frontend in `README.md`
- [X] T103 [US11] Add FY-aware environment variable docs in `backend/README.md`
- [X] T104 [US11] Add transition runbook for parallel manual books in `docs/implementation_plan.md`
- [X] T105 [US11] Add go-live smoke checklist in `docs/parallel-run.md`
- [X] T106 [US11] Add rollback/contingency playbook in `docs/README.md`

---

## Phase 14: Polish & Cross-Cutting

**Purpose**: Final consistency pass across docs, contracts, and quickstart validation.

- [X] T107 [P] Align invoice contract with implementation payloads in `specs/001-core-erp/contracts/invoice.yaml`
- [X] T108 [P] Align payment receipt contract with implementation payloads in `specs/001-core-erp/contracts/payment-receipt.yaml`
- [ ] T109 [P] Align hire memo contract with implementation payloads in `specs/001-core-erp/contracts/hirememo.yaml`
- [X] T110 Run quickstart API validation and refresh command list in `specs/001-core-erp/quickstart.md`
- [X] T111 Reconcile calculation language and formulas in `calculation.md`
- [X] T112 [P] Update user-manual steps for report and finance flows in `docs/user-manual.md`
- [X] T113 Final closure notes for gaps and readiness in `specs/001-core-erp/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 starts immediately.
- Phase 2 depends on Phase 1 and blocks all user stories.
- Phase 3 onward depends on Phase 2 completion.
- Phase 14 depends on completion of targeted user stories.

### User Story Dependencies

- US1 and US5 are MVP-critical after foundations.
- US2 depends on FY and sequencing utilities from foundational phase.
- US6 depends on invoice/payment data structures from US5.
- US7 depends on US2 financial event generation.
- US9 should be in place before final release of US5/US6/US7/US10.
- US10 depends on data from US1/US2/US4/US5/US6/US7.
- US11 depends on completion of at least US1, US5, US6, US9, and US10.

### Suggested Story Completion Order

1. US1 (Dispatch Register)
2. US5 (Billing & Invoice Register)
3. US6 (Payment Receipts)
4. US2 (Hire Memo)
5. US7 (Voucher & Ledger)
6. US9 (Security & Access)
7. US10 (Reporting)
8. US3 (Tracking & Alerts)
9. US4 (POD Management)
10. US8 (Master Data)
11. US11 (Deployment & Transition)

---

## Parallel Opportunities

- Setup: T003-T005 can run in parallel.
- Foundational: T010-T011-T013 can run in parallel after T009 starts.
- US1: T020 and T023 can run in parallel while backend service tasks progress.
- US5: T051 and T052 can run in parallel after print payload contract is stable.
- US6: T056 and T057 can run in parallel with backend T055.
- US10: report query clusters T076-T084 can be split across developers; frontend clusters T090-T098 can run in parallel.
- Polish: T107-T109-T112 can run in parallel.

## Parallel Example: User Story 10

```bash
Task: "T077 [US10] Implement driver settlement and driver outstanding queries in backend/app/services/reports_service.py"
Task: "T091 [US10] Build driver settlement and driver outstanding report views in frontend/src/features/reports/"
Task: "T100 [US10] Add CSV export actions for all FR10 report views in frontend/src/features/reports/"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 and US5.
3. Validate LR-to-invoice financial correctness and FY behavior.

### Incremental Delivery

1. Add US6 to close receivable event tracking.
2. Add US2 and US7 for hire/advance and ledger depth.
3. Add US9 then US10 for secure full reporting rollout.
4. Complete operational and transition stories (US3, US4, US8, US11).
