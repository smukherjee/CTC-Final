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
- Active FR10 reports are FY-filtered and exportable.
- Driver/vendor/profitability report projections return deterministic aggregates.

## 6) Smoke API Calls

```bash
curl "http://localhost:8000/api/billing/invoices?fy=2025-26"

curl -X POST "http://localhost:8000/api/payment-receipts/" \
  -H "X-User-Role: ACCOUNTS" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_date": "2026-03-15",
    "amount": 50000,
    "received_from": "ABC CLIENT",
    "payment_mode": "BANK",
    "financial_year": "2025-26",
    "notes": "RTGS"
  }'

curl "http://localhost:8000/api/reports/pending-billing?fy=2025-26"

curl "http://localhost:8000/api/reports/outstanding-receivables?fy=2025-26"

curl "http://localhost:8000/api/reports/hirememo-register?fy=2025-26"

curl "http://localhost:8000/api/reports/advance-register?fy=2025-26"

curl "http://localhost:8000/api/reports/driver-settlement?fy=2025-26"

curl "http://localhost:8000/api/reports/driver-outstanding?fy=2025-26"

curl "http://localhost:8000/api/reports/vendor-spend?fy=2025-26"

curl "http://localhost:8000/api/reports/advance-variance?fy=2025-26"

curl "http://localhost:8000/api/reports/advance-aging?fy=2025-26"

curl "http://localhost:8000/api/reports/cash-advance-utilization?fy=2025-26"

curl "http://localhost:8000/api/reports/hirememo-print-trace?fy=2025-26"

curl "http://localhost:8000/api/reports/trip-profitability?fy=2025-26"

curl "http://localhost:8000/api/reports/per-vehicle-cost?fy=2025-26"

curl "http://localhost:8000/api/reports/per-driver-performance?fy=2025-26"

curl "http://localhost:8000/api/reports/pod-delivery-status?fy=2025-26"

curl "http://localhost:8000/api/reports/pod-verification-worklist?fy=2025-26"

curl "http://localhost:8000/api/reports/eway-expiring?hours=8"

curl "http://localhost:8000/api/reports/receivables-aging?fy=2025-26"

curl "http://localhost:8000/api/reports/debit-voucher-register?fy=2025-26"

curl "http://localhost:8000/api/reports/bank-book?fy=2025-26"

curl "http://localhost:8000/api/reports/cash-book?fy=2025-26"

curl "http://localhost:8000/api/reports/audit-log?entity=Invoice"

curl "http://localhost:8000/api/reports/contract-expiry?days=30"

curl -i "http://localhost:8000/api/payment-receipts/?fy=2025-26" \
  -H "X-User-Role: OPS"
```

Expected:

- Finance endpoints return success for `X-User-Role: ACCOUNTS`.
- Finance endpoints reject non-finance role headers.
- Reports return FY-scoped rows.
- Report totals are numerically consistent with source transaction tables.

## 7) Artifacts Produced by Planning

- `specs/001-core-erp/plan.md`
- `specs/001-core-erp/research.md`
- `specs/001-core-erp/data-model.md`
- `specs/001-core-erp/quickstart.md`
- `specs/001-core-erp/contracts/invoice.yaml`
- `specs/001-core-erp/contracts/payment-receipt.yaml`
- `specs/001-core-erp/contracts/hirememo.yaml`
- `specs/001-core-erp/contracts/reports.yaml`
