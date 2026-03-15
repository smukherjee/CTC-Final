# Tasks: CTC-ERP Core (001-core-erp)

**Input**: Design documents from `specs/001-core-erp/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: No separate test-first task track is included because TDD/explicit test-task requirement was not requested in the specification.

**Organization**: Tasks are grouped by user story to allow independent implementation and validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align project scaffolding, routing, and shared utilities for FY-scoped operations.

- [ ] T001 Confirm backend router registration points in `backend/app/main.py`
- [ ] T002 Create FY utility functions in `backend/app/core/financial_year_utils.py`
- [ ] T003 [P] Create frontend FY helper utilities in `frontend/src/utils/financialYear.ts`
- [ ] T004 [P] Add shared invoice print helper shell in `frontend/src/utils/printInvoice.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement cross-story data and API foundations that all stories depend on.

**Critical**: User story implementation should begin only after this phase.

- [ ] T005 Add `financial_year` to LR model in `backend/app/models/lr.py`
- [ ] T006 Add `financial_year` and sequence constraints to HireMemo model in `backend/app/models/hirememo.py`
- [ ] T007 Add invoice header fields (`po_no`, `po_date`, `hsn_code`, `gst_paid_by`, `tax_on_reverse_charge`) in `backend/app/models/invoice.py`
- [ ] T008 Create LR deduction child model in `backend/app/models/lr.py`
- [ ] T009 Create Alembic migration for FY fields and numbering constraints in `backend/alembic/versions/`
- [ ] T010 Create Alembic migration for LR deduction child table in `backend/alembic/versions/`
- [ ] T011 [P] Add Pydantic schemas for LR deduction payloads in `backend/app/schemas/lr.py`
- [ ] T012 [P] Add shared invoice response fields (`gross`, `net`, `outstanding`) in `backend/app/schemas/invoice.py`
- [ ] T013 Enforce FY defaulting and format validation in `backend/app/core/financial_year_utils.py`
- [ ] T014 Wire foundational model imports and metadata bindings in `backend/app/models/__init__.py`

**Checkpoint**: Foundation complete. User stories can now proceed.

---

## Phase 3: User Story 1 - Centralized Dispatch Register (Priority: P1) 🎯 MVP

**Goal**: Capture complete LR details with FY scoping, deduction metadata, and inline E-way updates.

**Independent Test**: Create/update LR with deduction rows and verify Dispatch grid shows `driver_mobile`, inline E-way edit, and FY filtering.

- [ ] T015 [US1] Add LR deduction create/update service logic in `backend/app/services/lr_service.py`
- [ ] T016 [US1] Update LR API request/response to include deduction list in `backend/app/api/lr.py`
- [ ] T017 [US1] Add LR total recomputation from deduction rows in `backend/app/services/lr_service.py`
- [ ] T018 [US1] Expose FY query filter in LR list endpoint in `backend/app/api/lr.py`
- [ ] T019 [US1] Render `driver_mobile` grid column in `frontend/src/features/operations/DispatchRegister.tsx`
- [ ] T020 [US1] Implement inline E-way bill number/expiry editing in `frontend/src/features/operations/DispatchRegister.tsx`
- [ ] T021 [US1] Add FY dropdown and API param wiring in `frontend/src/features/operations/DispatchRegister.tsx`
- [ ] T022 [US1] Add LR deduction input rows in LR creation form in `frontend/src/features/operations/CreateLR.tsx`

---

## Phase 4: User Story 2 - Hire Memo Management (Priority: P2)

**Goal**: Create and manage FY-sequenced Hire Memos with auto balance and two-copy print.

**Independent Test**: Create a Hire Memo from LR, verify FY sequence number, balance auto-calculation, and dual-copy printable output.

- [ ] T023 [US2] Implement FY-sequence hire memo number allocation in `backend/app/services/hirememo_service.py`
- [ ] T024 [US2] Add uniqueness guard for `(financial_year, hire_memo_no)` writes in `backend/app/services/hirememo_service.py`
- [ ] T025 [US2] Add FY query filter in Hire Memo list endpoint in `backend/app/api/hirememo.py`
- [ ] T026 [US2] Add Hire Memo register page route in `frontend/src/App.tsx`
- [ ] T027 [US2] Build FY-filtered Hire Memo register view in `frontend/src/features/hirememo/HireMemoRegister.tsx`
- [ ] T028 [US2] Add amount-in-words rendering for Hire Memo print in `frontend/src/utils/printHireMemo.ts`
- [ ] T029 [US2] Update two-copy print layout in `frontend/src/templates/hirememo-template.hbs`

---

## Phase 5: User Story 3 - Real-Time Tracking and E-way Alerts (Priority: P3)

**Goal**: Maintain daily location updates and notify users for pre-expiry E-way bills.

**Independent Test**: Record tracking updates and confirm 8-hour pre-expiry alert appears for undelivered LRs.

- [ ] T030 [US3] Add 8-hour expiry alert query logic in `backend/app/services/reports_service.py`
- [ ] T031 [US3] Expose E-way alert endpoint in `backend/app/api/reports.py`
- [ ] T032 [US3] Implement daily vehicle location update endpoint in `backend/app/api/vehicle_location.py`
- [ ] T033 [US3] Render alert banner/modal on dashboard in `frontend/src/pages/Dashboard.tsx`
- [ ] T034 [US3] Add daily tracking update UI flow in `frontend/src/features/operations/TrackingLog.tsx`

---

## Phase 6: User Story 4 - POD Management (Priority: P4)

**Goal**: Record POD receipt status and manage digital POD document retrieval.

**Independent Test**: Flag POD received, upload POD file, and search POD by LR number and vehicle number.

- [ ] T035 [US4] Add POD status update endpoint in `backend/app/api/lr.py`
- [ ] T036 [US4] Implement POD file metadata persistence in `backend/app/services/storage_service.py`
- [ ] T037 [US4] Add POD search filters by LR and vehicle in `backend/app/api/reports.py`
- [ ] T038 [US4] Build POD management screen with upload control in `frontend/src/features/operations/PODManagement.tsx`
- [ ] T039 [US4] Add POD search and preview table in `frontend/src/features/operations/PODManagement.tsx`

---

## Phase 7: User Story 5 - Billing and Invoice Register (Priority: P1)

**Goal**: Generate FY-sequenced invoices from LR totals with TDS/net computation and printable annexure.

**Independent Test**: Create invoice from selected LRs, verify line amount uses LR `total`, net is header TDS adjusted, and print payload shows LR deduction `LESS` lines.

- [ ] T040 [US5] Implement invoice FY sequence generator in `backend/app/services/billing_service.py`
- [ ] T041 [US5] Enforce invoice line amount source from LR `total` in `backend/app/services/billing_service.py`
- [ ] T042 [US5] Disable invoice line charge recomposition handling in `backend/app/schemas/invoice.py`
- [ ] T043 [US5] Compute invoice `net_amount` from header TDS only in `backend/app/services/billing_service.py`
- [ ] T044 [US5] Add invoice print payload endpoint with LR deduction lines in `backend/app/api/billing.py`
- [ ] T045 [US5] Implement per-client + FY invoice register filters in `backend/app/api/billing.py`
- [ ] T046 [US5] Add invoice status/outstanding projection logic in `backend/app/services/billing_service.py`
- [ ] T047 [US5] Update invoice form to source line values from LR totals in `frontend/src/features/finance/InvoiceForm.tsx`
- [ ] T048 [US5] Add per-client tabs and outstanding summary in `frontend/src/features/finance/BillBook.tsx`
- [ ] T049 [US5] Add FY dropdown filtering in invoice register in `frontend/src/features/finance/BillBook.tsx`
- [ ] T050 [US5] Add invoice print template with deduction `LESS` lines in `frontend/src/templates/invoice-template.hbs`
- [ ] T051 [US5] Wire print payload mapper and trigger flow in `frontend/src/utils/printInvoice.ts`
- [ ] T052 [US5] Add invoice create/edit routing and navigation actions in `frontend/src/App.tsx`

---

## Phase 8: User Story 6 - Payment Receipts Register (Priority: P1)

**Goal**: Capture FY-scoped client receipt events independently from commercial deduction logic.

**Independent Test**: Create payment receipt with date/amount/received-from/FY/notes and verify register listing without deduction fields.

- [ ] T053 [US6] Simplify PaymentReceipt schema to receipt-event fields in `backend/app/schemas/payment_receipt.py`
- [ ] T054 [US6] Enforce no commercial deduction fields in receipt service in `backend/app/services/payment_receipt_service.py`
- [ ] T055 [US6] Add FY filter handling in payment receipt API in `backend/app/api/payment_receipts.py`
- [ ] T056 [US6] Create payment receipt register screen in `frontend/src/features/finance/PaymentReceiptsRegister.tsx`
- [ ] T057 [US6] Add FY dropdown and query wiring in `frontend/src/features/finance/PaymentReceiptsRegister.tsx`
- [ ] T058 [US6] Register payment receipt route and menu link in `frontend/src/App.tsx`

---

## Phase 9: User Story 7 - Voucher and Ledger Automation (Priority: P2)

**Goal**: Auto-generate vouchers for advances/balances and maintain ledger books from daily entries.

**Independent Test**: Create Hire Memo advances and verify voucher entries appear with correct debit/credit classification in ledger view.

- [ ] T059 [US7] Ensure hire memo advance voucher generation in `backend/app/services/voucher_service.py`
- [ ] T060 [US7] Add FY filtering in voucher listing endpoint in `backend/app/api/vouchers.py`
- [ ] T061 [US7] Add ledger running balance computation in `backend/app/services/ledger_service.py`
- [ ] T062 [US7] Add FY filter controls in ledger UI in `frontend/src/features/finance/LedgerBook.tsx`
- [ ] T063 [US7] Add voucher print template shell in `frontend/src/templates/voucher-template.hbs`

---

## Phase 10: User Story 8 - Master Data Management (Priority: P2)

**Goal**: Maintain consistent client/vendor/contract masters required by operations and billing.

**Independent Test**: Manage Client, Vendor/Broker, and Contract master records with required constraints (Vendor no GSTIN).

- [ ] T064 [US8] Remove vendor `gstin` from model and schema in `backend/app/models/vendor.py`
- [ ] T065 [US8] Add migration to drop vendor `gstin` in `backend/alembic/versions/`
- [ ] T066 [US8] Update vendor API validation to reject GSTIN payloads in `backend/app/api/vendor.py`
- [ ] T067 [US8] Remove GSTIN field from vendor UI forms in `frontend/src/features/vendor/VendorMaster.tsx`
- [ ] T068 [US8] Ensure FOB client master binding in LR form selectors in `frontend/src/features/operations/CreateLR.tsx`

---

## Phase 11: User Story 9 - Security and Access Control (Priority: P2)

**Goal**: Enforce role-based access so financial modules are limited to authorized users.

**Independent Test**: Non-Accounts user cannot access billing/payment/voucher actions while Accounts/Admin can.

- [ ] T069 [US9] Add role claims into auth token generation in `backend/app/services/auth_service.py`
- [ ] T070 [US9] Add route-level role guard dependencies for finance APIs in `backend/app/api/billing.py`
- [ ] T071 [US9] Add role guard dependencies for receipt and voucher APIs in `backend/app/api/payment_receipts.py`
- [ ] T072 [US9] Implement frontend route guard for finance paths in `frontend/src/layouts/AppLayout.tsx`
- [ ] T073 [US9] Hide finance navigation by role in `frontend/src/components/Sidebar.tsx`

---

## Phase 12: User Story 10 - Reporting (Priority: P2)

**Goal**: Provide pending-billing and outstanding-receivables reports with FY scope.

**Independent Test**: Generate reports showing unbilled aged LRs and client-wise outstanding with totals.

- [ ] T074 [US10] Implement aged unbilled LR report query in `backend/app/services/reports_service.py`
- [ ] T075 [US10] Implement outstanding receivables aggregation in `backend/app/services/reports_service.py`
- [ ] T076 [US10] Expose FY-filtered report endpoints in `backend/app/api/reports.py`
- [ ] T077 [US10] Build pending billing report UI in `frontend/src/features/reports/PendingBillingReport.tsx`
- [ ] T078 [US10] Build outstanding receivables report UI in `frontend/src/features/reports/OutstandingReceivablesReport.tsx`

---

## Phase 13: User Story 11 - Deployment and Transition (Priority: P3)

**Goal**: Support production deployment and transition period with manual books in parallel.

**Independent Test**: Deploy app with documented runbook and verify dual-run operational checklist.

- [ ] T079 [US11] Update deployment steps for backend/frontend in `README.md`
- [ ] T080 [US11] Add environment variable documentation for FY-aware services in `backend/README.md`
- [ ] T081 [US11] Add transition runbook for parallel manual books in `docs/implementation_plan.md`
- [ ] T082 [US11] Add smoke verification checklist for go-live in `docs/parallel-run.md`
- [ ] T083 [US11] Document rollback/contingency steps in `docs/README.md`

---

## Phase 14: Polish and Cross-Cutting

**Purpose**: Final consistency, cleanup, and release readiness across stories.

- [ ] T084 [P] Align OpenAPI contracts to implemented payloads in `specs/001-core-erp/contracts/invoice.yaml`
- [ ] T085 [P] Align payment receipt contract to implemented payload in `specs/001-core-erp/contracts/payment-receipt.yaml`
- [ ] T086 Run end-to-end quickstart validation and refresh commands in `specs/001-core-erp/quickstart.md`
- [ ] T087 Reconcile calculation and spec language consistency in `calculation.md`
- [ ] T088 [P] Update user manual screenshots/steps for new flows in `docs/user-manual.md`
- [ ] T089 Final review of unresolved gaps and closure notes in `specs/001-core-erp/README.md`

---

## Dependencies and Execution Order

### Phase Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 blocks all user stories.
- After Phase 2, user stories can progress in priority order with selective parallel work.
- Phase 14 runs after desired user stories are completed.

### User Story Dependencies

- US1 and US5 are MVP-critical and should be completed first after foundations.
- US2 depends on foundational numbering and FY utilities from Phase 2.
- US6 depends on invoice/payment data structures from US5 for reconciliation display.
- US7 depends on US2 financial event generation.
- US9 should be applied before final release of US5/US6/US7.
- US10 depends on data produced by US1/US5/US6.
- US11 depends on completion of at least US1, US5, US6, and US9.

### Recommended Delivery Sequence

1. Setup + Foundational
2. US1 (Dispatch) + US5 (Billing)
3. US6 (Payment Receipts)
4. US2 (Hire Memo) + US7 (Vouchers/Ledger)
5. US9 (Security)
6. US10 (Reporting)
7. US3 + US4 (Tracking/POD)
8. US8 (Master Data hardening)
9. US11 (Deployment/Transition)
10. Polish

---

## Parallel Execution Examples

### US1 Parallel Example

- T019 and T021 can run in parallel (`frontend/src/features/operations/DispatchRegister.tsx` and FY utility wiring in separate sections).
- T015 and T020 can run in parallel (`backend/app/services/lr_service.py` and UI inline edit implementation path).

### US5 Parallel Example

- T044 and T048 can run in parallel (`backend/app/api/billing.py` and `frontend/src/features/finance/BillBook.tsx`).
- T050 and T051 can run in parallel (`frontend/src/templates/invoice-template.hbs` and `frontend/src/utils/printInvoice.ts`).

### US6 Parallel Example

- T055 and T056 can run in parallel (`backend/app/api/payment_receipts.py` and `frontend/src/features/finance/PaymentReceiptsRegister.tsx`).

---

## Implementation Strategy

### MVP First

- Complete through Phase 7 (US1 + US5) and validate invoice creation from LR totals.

### Incremental Delivery

- Add US6 immediately after MVP for receivable closure tracking.
- Add operational and finance support stories (US2/US7/US9/US10) in small releases.

### Final Hardening

- Complete remaining operational stories (US3/US4/US8), then deployment transition (US11), then polish.
