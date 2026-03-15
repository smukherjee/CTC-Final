# Research: CTC-ERP Core (001-core-erp)

**Phase**: 0 - Research  
**Date**: 2026-03-15  
**Status**: Complete

## Decision 1: Invoice Billing Base

- Decision: Invoice line amount must come from LR `total` only.
- Rationale: Prevents invoice-time recomputation drift and aligns with clarified spec decisions.
- Alternatives considered:
    - Recompute from editable line charge components: rejected due to mismatch risk.
    - Use `freight_amount` as invoice base: rejected because final billable value is LR `total`.

## Decision 2: Deduction Model

- Decision: LR supports multiple deductions; each deduction is `label + fixed INR amount`.
- Rationale: Matches real billing cases with multiple `LESS` entries and keeps arithmetic auditable.
- Alternatives considered:
    - Single deduction per LR: rejected as too restrictive.
    - Percentage deductions: rejected due to rounding and reconciliation complexity.

## Decision 3: Deduction Stage Ownership

- Decision: Commercial deductions are captured only at LR stage.
- Rationale: Maintains single source of truth and avoids double deduction between invoice and receipt.
- Alternatives considered:
    - Allow deduction at both LR and receipt: rejected due to over/under-collection risk.
    - Shift all deductions to receipt stage: rejected because invoice print transparency needs LR-context deduction lines.

## Decision 4: Payment Receipt Scope

- Decision: Payment receipt records only receipt event fields (`payment_date`, `amount`, `received_from`, `financial_year`, `notes`).
- Rationale: Receipt register tracks realization, not commercial invoice composition.
- Alternatives considered:
    - Include deduction split fields in receipt: rejected for current clarified scope.

## Decision 5: FY and Numbering

- Decision: FY-scoped entities and per-FY sequences (Invoice `{seq}/{YY-YY}`, HireMemo sequential integer).
- Rationale: Mirrors manual book operation and improves continuity during transition.
- Alternatives considered:
    - Global numbering across years: rejected due to operational mismatch.

## Decision 6: Print Strategy

- Decision: Continue existing frontend print template flow (HTML/template + browser print).
- Rationale: Consistent with current project architecture and avoids new rendering stack.
- Alternatives considered:
    - Backend PDF stack: rejected as unnecessary infra complexity for this phase.

## Outcome

All previously open billing clarifications are resolved and encoded in `spec.md` (session 2026-03-15). No `NEEDS CLARIFICATION` items remain.
