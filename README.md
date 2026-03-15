# CTC-ERP Core

CTC-ERP Core is a split web application:

- `backend/`: FastAPI + SQLAlchemy + Alembic
- `frontend/`: React + TypeScript + Vite
- `specs/`: feature specs, contracts, and delivery tasks

## Deployment Paths

### Option A: Docker Compose (recommended)

1. From repository root, build and start all services:

```bash
docker compose up --build -d
```

2. Confirm service health:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

3. Open applications:

- Frontend: `http://localhost:5173`
- Backend OpenAPI: `http://localhost:8000/docs`

### Option B: Native process deployment

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
