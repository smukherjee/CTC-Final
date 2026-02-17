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
- Migrations: `backend/db/migrations/`
- Feature docs: this folder
