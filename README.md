# CTC-ERP Core

CTC-ERP Core is a split web application:

- `backend/`: FastAPI + SQLAlchemy + Alembic
- `frontend/`: React + TypeScript + Vite
- `specs/`: feature specs, contracts, and delivery tasks

## Quick Start (Recommended)

From repository root, use the Makefile to orchestrate all services:

```bash
make dev-up          # Start all dev services (build if needed)
make dev-ps          # View running container status
make dev-logs        # Tail combined service logs
make seed-sample     # Load comprehensive 15-scenario sample dataset
```

For a full clean rebuild with sample data:

```bash
make build-all       # Reset DB, clean build, seed full dataset
```

Applications:

- Frontend: `http://localhost:5173`
- Backend OpenAPI: `http://localhost:8000/docs`

Available commands:

```bash
make help            # Show all commands
make dev-down        # Stop all services
make migrate         # Run alembic upgrade head
make reset           # Delete all volumes (destructive)
make rebuild-backend # No-cache rebuild of backend image
make rebuild-frontend # No-cache rebuild of frontend image
```

## Alternative: Native Process Deployment

1. Backend setup and start:

```bash
cd backend
python3 -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

2. Frontend setup and start (new terminal):

```bash
cd frontend
npm install
npm run build
npm run dev -- --host 0.0.0.0 --port 5173
```

## Production Notes

- Run Alembic migrations on every release (`alembic upgrade head`).
- Finance routes require `X-User-Role` header values `ADMIN` or `ACCOUNTS`.
- Prefer FY-scoped report and register APIs by passing `fy=YYYY-YY`.

## References

- Feature quickstart: `specs/001-core-erp/quickstart.md`
- Implementation plan: `specs/001-core-erp/plan.md`
- Task tracker: `specs/001-core-erp/tasks.md`
