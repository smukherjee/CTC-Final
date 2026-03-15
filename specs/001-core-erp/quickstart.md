# Quickstart: CTC-ERP Core Plan Validation

**Date**: 2026-03-15

## 1) Prepare Environment

```bash
cd "/Users/sujoymukherjee/code/ctc/CTC Final"
source .venv/bin/activate
```

## 2) Build Sanity

```bash
make build-all
```

Expected:
- backend compile checks pass
- frontend build succeeds

## 3) Run Backend

```bash
cd backend
source ../.venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Open: `http://localhost:8000/docs`

## 4) Run Frontend

```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173`

## 5) Validate Planned Behaviors

- LR supports multiple fixed-amount deduction rows.
- LR `total` reflects all LR deductions.
- Invoice line amount is derived from LR `total`.
- Invoice does not recompute from editable charge composition at billing stage.
- Invoice `net_amount = gross_amount - tds_amount`.
- Invoice print payload includes LR deduction entries as `LESS` lines.
- Payment receipt captures only receipt event fields (no commercial deduction fields).

## 6) Smoke API Calls

```bash
curl "http://localhost:8000/api/billing/invoices?fy=2025-26"

curl -X POST "http://localhost:8000/api/payment-receipts/" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_date": "2026-03-15",
    "amount": 50000,
    "received_from": "ABC CLIENT",
    "financial_year": "2025-26",
    "notes": "RTGS"
  }'
```

## 7) Artifacts Produced by Planning

- `specs/001-core-erp/plan.md`
- `specs/001-core-erp/research.md`
- `specs/001-core-erp/data-model.md`
- `specs/001-core-erp/quickstart.md`
- `specs/001-core-erp/contracts/invoice.yaml`
- `specs/001-core-erp/contracts/payment-receipt.yaml`
- `specs/001-core-erp/contracts/hirememo.yaml`
