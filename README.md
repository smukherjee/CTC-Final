# Root README for CTC-ERP Core

This repository contains the CTC-ERP Core implementation.

- frontend/: React + Vite + TypeScript + Tailwind CSS
- backend/: FastAPI + PostgreSQL + Alembic
- specs/: Functional specs, plans, and tasks
- rectcsampledata/: Sample data for testing

## Local Development Setup

1. Follow the full setup and run instructions in [specs/001-core-erp/quickstart.md](specs/001-core-erp/quickstart.md).
2. Start backend and frontend after running migrations:
   - Backend: `uvicorn app.main:app --reload --port 8000`
   - Frontend: `npm run dev`
3. Optional Docker workflow:
   - `docker compose up --build`
   - Backend container now runs `alembic upgrade head` automatically on start.

See [specs/001-core-erp/plan.md](specs/001-core-erp/plan.md) for implementation plan and [specs/001-core-erp/tasks.md](specs/001-core-erp/tasks.md) for execution status.
