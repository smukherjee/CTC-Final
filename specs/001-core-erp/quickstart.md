# Quickstart: CTC-ERP Core (001-core-erp)

**Date**: 2026-03-05

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ running locally (or via Docker)
- Docker + Docker Compose (optional but recommended)

---

## 1. Clone & Setup

```bash
# From repo root
cd "CTC Final"

# Install Python dependencies
cd backend
python -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
pip install reportlab          # NEW: PDF generation

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 2. Database Setup

```bash
# Start PostgreSQL (or use local installation)
docker-compose up -d db        # if using docker-compose.yml at repo root

# Copy env file and set DB URL
cd backend
cp .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql://user:password@localhost:5432/ctc_erp

# Run all migrations (includes new FY fields, Invoice, PaymentReceipt tables)
source ../.venv/bin/activate
alembic upgrade head
```

---

## 3. Running the Backend

```bash
cd backend
source ../.venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

Key new endpoints after this feature:
- `GET/POST /api/billing/invoices` — Invoice register
- `GET /api/billing/invoices/{id}/pdf` — Invoice PDF
- `GET/POST /api/payment-receipts/` — Payment Receipts register

---

## 4. Running the Frontend

```bash
cd frontend
npm run dev
```

App available at: `http://localhost:5173`

Key new/updated screens:
- `/dispatch` — DispatchRegister with `driver_mobile`, inline E-way bill, FY filter
- `/hire-memos` — Hire Memo entry with auto-numbered HM no.
- `/hire-memo-register` — HireMemo Register list with FY filter
- `/bills` — BillBook with TDS/NET columns, per-client tabs, FY filter
- `/payment-receipts` — NEW: Payment Receipts Register

---

## 5. Running with Docker Compose

```bash
# From repo root
docker-compose up --build
```

Services started:
- `db` — PostgreSQL on port 5432
- `backend` — FastAPI on port 8000
- `frontend` — Vite dev server on port 5173

---

## 6. Common Dev Tasks

### Add a financial year migration (example for `lrs`)

```bash
cd backend
source ../.venv/bin/activate
alembic revision --autogenerate -m "add_financial_year_to_lrs"
# Edit the generated file to add DEFAULT '2025-26' and backfill
alembic upgrade head
```

### Test invoice auto-numbering

```bash
# Create two invoices and check they get sequential numbers
curl -X POST http://localhost:8000/api/billing/invoices \
  -H "Content-Type: application/json" \
  -d '{"client_id":1,"invoice_date":"2026-03-05","financial_year":"2025-26","lines":[]}'

# Expect invoice_no: "1/25-26"
```

### Test amount-in-words

```python
from app.core.amount_in_words import inr_words
from decimal import Decimal
print(inr_words(Decimal("105000.00")))
# → "Rupees One Lakh Five Thousand Only"
```

### Generate invoice PDF

```bash
curl http://localhost:8000/api/billing/invoices/1/pdf --output invoice_1.pdf
```

---

## 7. New Files Checklist

After completing all tasks, these files should exist:

```
backend/app/core/financial_year_utils.py  ← T043
backend/app/core/amount_in_words.py       ← T044
backend/app/models/invoice.py             ← T036b
backend/app/models/payment_receipt.py     ← T056
backend/app/schemas/invoice.py
backend/app/schemas/payment_receipt.py
backend/app/services/billing_service.py   ← T036, T038
backend/app/services/payment_receipt_service.py ← T058
backend/app/api/billing.py                ← T037
backend/app/api/payment_receipts.py       ← T059

frontend/src/features/hirememo/HireMemoRegister.tsx  ← T051
frontend/src/features/finance/PaymentReceiptsRegister.tsx ← T060
frontend/src/features/finance/InvoicePDF.tsx          ← T038
frontend/src/utils/financialYear.ts
```
