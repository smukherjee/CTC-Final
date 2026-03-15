# Reporting and Audit Requirements

## FR10 Active Reporting Scope

### 1. Pending Billing Report
- Purpose: List unbilled LRs/Hire Memos older than 15-20 days.
- Core fields: LR No, Date, Consignor, Consignee, Vehicle No, Origin, Destination, Amount, Status, Reason Pending.

### 2. Outstanding Receivables Report
- Purpose: Show client-wise unpaid invoices and total outstanding.
- Core fields: Invoice No, Invoice Date, Client, Gross Amount, TDS, Net Amount, Amount Received, Outstanding, Status.

### 3. Hire Memo Register Report (FY-wise)
- Purpose: FY-filtered Hire Memo summary and settlement view.
- Core fields: HM No, HM Date, LR No, Vehicle No, Driver, Total Hire, Advance Cash, Advance Bank, Balance, Status.

### 4. Advance Payment Register (Hire Memo Advances)
- Purpose: Track advance disbursements against hire memos.
- Core fields: HM No, Advance Date, Mode, Amount, Ref No, Paid By, FY.

### 5. Driver-Wise Settlement Report
- Purpose: Track settlements aggregated by driver.
- Core fields: Driver Name/Mobile, Total Trips, Total Hire, Total Advance, Total Balance Payable, Total Paid, Pending Balance.

### 6. Driver Outstanding / Balance Due Report
- Purpose: List pending driver/broker dues with ageing.
- Core fields: Driver, HM No, Balance Amount, Days Pending, Last Payment Date.

### 7. Broker/Vendor-Wise Hire Spend Report
- Purpose: Monitor broker/vendor spend and payout profile.
- Core fields: Broker/Vendor, Trip Count, Gross Hire, Advances, Final Payout, TDS Flag/Declaration.

### 8. Advance vs Final Settlement Variance Report
- Purpose: Highlight over/under-settlement and approval trail.
- Core fields: HM No, Expected Balance, Actual Paid, Variance, Reason, Approved By.

### 9. Advance Aging Report
- Purpose: Age open advances to support closure controls.
- Core fields: HM No, Driver/Broker, Advance Amount, Age Bucket, Closure Status.

### 10. Cash Advance Utilization Report
- Purpose: Monitor petty-cash effect of advance payouts.
- Core fields: Opening Cash, Advances Paid, Refunds/Adjustments, Closing Cash Impact.

### 11. Hire Memo Print Trace Report
- Purpose: Track print accountability for hire memo copies.
- Core fields: HM No, Print Type, Printed By, Printed At, Print Count.

### 12. Trip Profitability Report (HM Cost vs Invoice Revenue)
- Purpose: Compare hire costs vs client billing realization.
- Core fields: LR/HM Linkage, Customer Revenue, Hire Cost, Margin, Margin %.

### 13. Per Vehicle Cost Report
- Purpose: Track total and average transport cost per vehicle.
- Core fields: Vehicle No, Trip Count, Total Hire, Avg Cost/Trip, Avg Cost/Km (if km available).

### 14. Per Driver Performance + Cost Report
- Purpose: Combine driver performance signals with payout cost.
- Core fields: Driver, On-time Deliveries (if available), Trip Count, Total Hire Cost, Avg Payout/Trip.

### 15. POD Delivery Status Report
- Purpose: Billing-readiness view by POD lifecycle status.
- Core fields: LR No, Delivered On, POD Received, POD Verified, Days Since Delivery, Billing Ready.

### 16. POD Verification Worklist Report (Accounts)
- Purpose: Queue of PODs awaiting physical verification.
- Core fields: LR No, Customer, Uploaded POD Date, Physical POD Status, Assigned To, Pending Days.

### 17. E-way Bill Expiry Alert Report
- Purpose: Operational alerts for upcoming/overdue e-way expiries.
- Core fields: LR No, Vehicle No, E-way Bill No, Expiry Date/Time, Hours Remaining, Delivery Status.

### 18. Receivables Aging / Dashboard Export
- Purpose: Aging buckets for receivables follow-up and export.
- Core fields: Client, Current, 1-30, 31-60, 61-90, 90+, Total Outstanding.

### 19. Audit Log Report
- Purpose: Track create/update/delete changes across key entities.
- Core fields: Entity, Record ID, Field, Old Value, New Value, Changed By, Timestamp, Action.

### 20. Contract Expiry Report
- Purpose: List contracts expiring in configurable window.
- Core fields: Contract No, Client, Start Date, End Date, Status, Alert Sent.

### 21. Debit Voucher Report/Print Register
- Purpose: Voucher-level visibility for advances/balances and audit traceability.
- Core fields: Voucher No, Voucher Date, HM/Reference No, Party, Amount, Mode, Approved By, Print Status.

### 22. Bank Book Report
- Purpose: Daily bank-side ledger summary.
- Core fields: Date, Voucher/Txn Ref, Debit, Credit, Running Balance, Narration.

### 23. Cash Book Report
- Purpose: Daily cash-side ledger summary.
- Core fields: Date, Voucher/Txn Ref, Debit, Credit, Running Balance, Narration.

## Common Filters (All Reports)
- Financial Year (mandatory)
- Date range
- Role-based data visibility
- Export support (CSV at minimum)

## Audit Trail Requirements
- All fields and dates in Dispatch Register (DR), Lorry Receipt (LR), and HireMemo must be fully audited (track all changes with user and timestamp).
- For other entities (Invoice, User, Contract, Vehicle, Vendor, Document Template), audit only create, delete, and key field updates (for example status, amount, expiry date).
- Audit logs must be immutable and queryable by admin users.
- Retain audit logs for a minimum of 7 years.
