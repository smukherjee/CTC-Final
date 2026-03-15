# Implementation Plan: CTC-ERP Core (Billing, FY Scoping, Registers)

**Branch**: `001-core-erp` | **Date**: 2026-03-15 | **Spec**: `/specs/001-core-erp/spec.md`
**Input**: Feature specification from `/specs/001-core-erp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement the remaining core ERP flows with priority on dispatch-to-invoice financial correctness: FY-scoped numbering, LR-total-based billing, LR-stage fixed-amount deductions, invoice generation/print, and payment receipts as pure receipt records. The approach uses existing FastAPI + SQLAlchemy backend and React + Vite frontend patterns, extends current models/services/routes, and adds aligned API contracts and print outputs without introducing new infrastructure.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x + React 18 (frontend)  
**Primary Dependencies**: FastAPI, SQLAlchemy, Alembic, Pydantic, React, Vite  
**Storage**: PostgreSQL (primary transactional store), local file/object storage abstraction for uploads  
**Testing**: pytest (backend), TypeScript build/lint and UI smoke flow checks (frontend)  
**Target Platform**: Linux/macOS dev environments; browser-based web app
**Project Type**: Web application (separate `backend/` and `frontend/`)  
**Performance Goals**: Register list/filter APIs return p95 < 2s for FY-scoped queries up to 5k rows; invoice creation < 1s server processing  
**Constraints**: Strong financial correctness (no silent rounding drift), FY scoping enforced on all register entities, backward compatibility with existing data  
**Scale/Scope**: Single company deployment, low-to-moderate concurrent office users (10-30), 10k+ yearly transaction records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution document at `.specify/memory/constitution.md` is a placeholder template with no enforceable principles defined.
- Gate C1 (Defined principles available): `CONDITIONAL PASS` (cannot evaluate formal rules due to placeholders).
- Gate C2 (Violations identified and justified): `PASS` (no explicit constitutional constraints exist yet; planning proceeds under existing repository conventions and spec clarifications).
- Gate C3 (No unresolved clarification blockers): `PASS` (latest billing clarifications captured in `spec.md` session 2026-03-15).

Post-design re-check:
- Gate C1: unchanged (`CONDITIONAL PASS`) until constitution is finalized.
- Gate C2: `PASS`; design artifacts are aligned with spec and clarified decisions.
- Gate C3: `PASS`; no `NEEDS CLARIFICATION` items remain in this plan.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-erp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── hirememo.yaml
│   ├── invoice.yaml
│   └── payment-receipt.yaml
└── tasks.md
```

### Source Code (repository root)
```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── storage/
├── alembic/
│   └── versions/
└── requirements.txt

frontend/
├── src/
│   ├── components/
│   ├── features/
│   ├── layouts/
│   ├── pages/
│   ├── templates/
│   ├── types/
│   └── utils/
└── package.json
```

**Structure Decision**: Use the existing web split (`backend/` + `frontend/`). Backend owns domain logic, persistence, and FY enforcement; frontend owns register workflows, filtering UI, and browser print templates.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No enforceable constitution principles yet | Constitution file is placeholder-only in repository | Blocking planning would halt delivery despite clear feature spec and accepted clarifications |
