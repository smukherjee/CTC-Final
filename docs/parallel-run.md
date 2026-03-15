# Parallel Run Support

This document defines the minimum smoke checks for running CTC-ERP in parallel with legacy/manual books.

## Smoke Verification Checklist

- [ ] Backend API reachable at `/docs` and health endpoints.
- [ ] Frontend login/layout loads and FY selector defaults correctly.
- [ ] Create one LR and verify it appears in Dispatch Register.
- [ ] Mark POD received and verify LR appears in pending-billing report after aging rule conditions.
- [ ] Generate one invoice and verify print payload endpoint returns 200.
- [ ] Create one payment receipt (amount-only event) linked to invoice.
- [ ] Verify invoice status updates (`issued` -> `partially_paid` or `paid`).
- [ ] Verify outstanding receivables report reflects payment impact.
- [ ] Verify voucher/ledger entries are visible with running balance.
- [ ] Confirm finance API access is blocked for non-finance role header.

## Daily Sign-off Template

- Date:
- FY:
- Operator:
- Accounts reviewer:
- Smoke checklist completed: Yes/No
- Mismatches found:
- Corrective action taken:
- Final sign-off:
