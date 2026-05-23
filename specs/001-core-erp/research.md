# Research: CTC-ERP Core (001-core-erp)

**Phase**: 0 - Research  
**Date**: 2026-03-15  
**Status**: Complete

## Decision 1: Invoice Billing Base

- Decision: Invoice line amount is derived from LR `total` only.
- Rationale: Eliminates invoice-layer recomputation drift and matches clarified billing rule.
- Alternatives considered:
    - Recompute from editable charge components: rejected due to mismatch/reconciliation risk.
    - Use freight-only basis: rejected because contractual billable base is LR grand total.

## Decision 2: Deduction Model

- Decision: LR supports multiple fixed INR deductions (`label + amount`).
- Rationale: Required for real `LESS` scenarios and transparent print/audit output.
- Alternatives considered:
    - Single deduction per LR: rejected as insufficient.
    - Percentage deductions: rejected due to rounding and audit complexity.

## Decision 3: Deduction Stage Ownership

- Decision: Commercial deductions are captured only at LR stage.
- Rationale: Single source of truth and no double-deduction risk.
- Alternatives considered:
    - Deductions at both LR and receipt stages: rejected for inconsistency risk.

## Decision 4: Payment Receipt Scope

- Decision: Payment receipts remain pure realization events (`payment_date`, `amount`, `received_from`, `financial_year`, `notes`).
- Rationale: Separation of settlement realization from commercial charge composition.
- Alternatives considered:
    - Capture deduction logic in receipts: rejected as out-of-scope and error-prone.

## Decision 5: FY and Numbering

- Decision: FY-scoped entities with per-FY sequencing (invoice `{seq}/{YY-YY}`, hire memo sequential integer).
- Rationale: Aligns with manual register operation and year-end continuity.
- Alternatives considered:
    - Global sequences across years: rejected due to operational mismatch.

## Decision 6: Active FR10 Reporting Scope

- Decision: FR10 includes expanded operational + finance report set as active scope (not deferred).
- Rationale: Business requested complete reporting visibility for dispatch, hire, settlements, profitability, and compliance.
- Alternatives considered:
    - Restrict FR10 to pending/outstanding only: rejected due to immediate stakeholder needs.

## Decision 7: Report Delivery Strategy

- Decision: Implement reports as API-driven views with shared FY/date filters and CSV export baseline.
- Rationale: Reuse existing report routing/patterns and ensure audit-friendly exports.
- Alternatives considered:
    - One monolithic report endpoint: rejected due to maintainability and payload bloat.
    - UI-only aggregation: rejected due to performance and consistency risks.

## Decision 8: Print and Traceability Reports

- Decision: Hire Memo print accountability will be represented via print trace report fields (`print_type`, `printed_by`, `printed_at`, `count`) backed by audit/print events.
- Rationale: Required to match manual control expectations for physical copies.
- Alternatives considered:
    - No print trace report: rejected as audit gap.

## Outcome

No unresolved clarification markers remain for planning artifacts. Current design proceeds with active FR10 report expansion and existing core ERP constraints.
