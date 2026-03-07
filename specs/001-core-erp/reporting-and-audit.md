# Reporting and Audit Requirements

## Required Reports

### 1. Pending Billing Report
- **Purpose:** List all Lorry Receipts (LRs) and Hire Memos for which billing/invoice is pending.
- **Fields:** LR No, Date, Consignor, Consignee, Vehicle No, Origin, Destination, Amount, Status, Reason Pending
- **Filters:** Date range, Consignor/Consignee, Vehicle, Status

### 2. Audit Log Report
- **Purpose:** Track all changes to key entities (DR, LR, HireMemo, Invoice, User, Contract).
- **Fields:** Entity, Record ID, Field, Old Value, New Value, Changed By, Timestamp, Action (Create/Update/Delete)
- **Filters:** Entity, User, Date range, Action

### 3. Contract Expiry Report
- **Purpose:** List contracts expiring within a configurable window (default: 30 days).
- **Fields:** Contract No, client, Start Date, End Date, Status, Alert Sent (Y/N)
- **Filters:** Date range, client, Status

---

## Audit Trail Requirements
- All fields and dates in Dispatch Register (DR), Lorry Receipt (LR), and HireMemo must be fully audited (track all changes with user and timestamp).
- For other entities (Invoice, User, Contract, Vehicle, Vendor, Document Template), audit only create, delete, and key field updates (e.g., status, amount, expiry date).
- Audit logs must be immutable and queryable by admin users.
- Retain audit logs for a minimum of 7 years.
