# Implementation Plan: CTC-ERP Core (Billing, FY Scoping, Registers, Active FR10 Reporting)

**Branch**: `001-core-erp` | **Date**: 2026-03-15 | **Spec**: `/specs/001-core-erp/spec.md`
**Input**: Feature specification from `/specs/001-core-erp/spec.md`

**Note**: This file is produced by `/speckit.plan` and updated to match current FR10 active reporting scope.

## Summary

Implement the full CTC-ERP core workflow from dispatch through invoicing and receipts, with FY-scoped data, strict billing correctness (`LR.total` basis), and expanded active FR10 reporting. The approach reuses existing FastAPI + SQLAlchemy + React architecture, adds/extends reporting endpoints and UI views, and keeps operational/audit constraints first-class.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x + React 18 (frontend)  
**Primary Dependencies**: FastAPI, SQLAlchemy, Alembic, Pydantic, React, Vite  
**Storage**: PostgreSQL for transactional data; existing file storage abstraction for document uploads  
**Testing**: pytest backend checks, TypeScript build/lint, and smoke API/UI validation  
**Target Platform**: Linux/macOS dev environments, browser-based web app  
**Project Type**: Web application (`backend/` + `frontend/`)  
**Performance Goals**: FY-scoped register/report APIs p95 < 2s for up to 5k rows; invoice creation server processing < 1s  
**Constraints**: Financial correctness over convenience, FY scoping enforced on register entities, auditability retained, role-based finance restrictions  
**Scale/Scope**: Single-company deployment, 10-30 concurrent office users, 10k+ yearly transactional records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file `.specify/memory/constitution.md` is currently a placeholder template (no enforceable principles).
- Gate C1 (Principles defined): `CONDITIONAL PASS` with justification (cannot evaluate missing rules).
- Gate C2 (No unjustified violations): `PASS` (planning follows repository standards and explicit feature spec).
- Gate C3 (No unresolved clarifications): `PASS` (open clarifications resolved in `spec.md` session notes; reporting scope is explicit and active).

Post-design re-check:
- Gate C1: unchanged (`CONDITIONAL PASS`) until constitution is ratified.
- Gate C2: `PASS` (design docs and contracts aligned to active FR10 scope).
- Gate C3: `PASS` (no `NEEDS CLARIFICATION` markers remain in this plan set).

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
│   ├── payment-receipt.yaml
│   └── reports.yaml
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

**Structure Decision**: Keep existing split architecture. Backend owns validation, report aggregation, and role-guarded APIs. Frontend owns report views, filters, and export/print UX.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution file is placeholder-only | Planning cannot be blocked while feature scope is explicitly defined and approved | Waiting for constitution ratification would halt delivery with no technical benefit |
