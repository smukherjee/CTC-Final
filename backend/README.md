# Backend Service Guide

This directory contains the FastAPI backend for CTC-ERP Core.

## Structure

- `app/`: application modules (API, models, schemas, services)
- `alembic/`: database migrations
- `requirements.txt`: Python dependencies

## Required Environment Variables

- `DATABASE_URL`: SQLAlchemy connection string used by API and Alembic.

Example:

```bash
export DATABASE_URL="postgresql+psycopg2://user:pass@localhost:5432/ctc"
```

## Optional Environment Variables

- `DEFAULT_FINANCIAL_YEAR`: fallback FY (`YYYY-YY`) when payload/query omits FY.
- `TZ`: service timezone used by date-based reporting (recommended: `Asia/Kolkata`).
- `LOG_LEVEL`: backend logging level (`INFO`, `DEBUG`, etc.).

Example:

```bash
export DEFAULT_FINANCIAL_YEAR="2025-26"
export TZ="Asia/Kolkata"
export LOG_LEVEL="INFO"
```

## Runbook

```bash
source ../.venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## FY-Aware Behavior

- Register/report endpoints accept `fy` query filter.
- Entity writes derive FY from payload or fallback helper.
- Finance APIs (`billing`, `payment-receipts`, `vouchers`) require role header `X-User-Role: ADMIN|ACCOUNTS`.
