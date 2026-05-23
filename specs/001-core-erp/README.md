# CTC-ERP Core Feature Docs

This folder contains design artifacts and a short developer runbook for the `CTC-ERP Core` feature.

Quick run (development, uses Docker Compose):

```bash
# build and start services
docker compose up --build -d

# backend logs
docker compose logs -f backend

# run alembic migrations inside backend container (if needed)
docker compose exec backend alembic -c db/alembic.ini upgrade head

# run seed scripts inside backend (example)
docker compose exec backend python app/scripts/seed_cities.py
```

Location of important files:
- Backend: `backend/`
- Frontend: `frontend/`
- Migrations: `backend/alembic/versions/`

## Closure Notes

Completed scope highlights:

- FY-aware numbering and filtering across operational and finance registers.
- LR deduction rows and LR-total based invoice generation.
- Payment receipt register simplified to amount-only receipt events.
- Voucher and ledger running-balance support.
- Finance role guards in backend routes and frontend visibility rules.
- Pending-billing and outstanding receivables reports split into dedicated views.

## Unresolved Gaps Review

- No blocking functional gaps remain for core ERP flows in this feature branch.
- Recommended follow-up: add automated API tests for finance role guard and report aggregations.
- Recommended follow-up: monitor frontend bundle size warnings and split heavy grids if needed.
