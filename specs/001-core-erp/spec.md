# CTC-ERP Core Feature Specification

## Overview
This specification defines the core features required for the CTC-ERP system, focusing on the transition from manual registers to a centralized logistics ERP. It also documents the current implementation status and identifies key gaps to be addressed for a complete, simple, and functional system.

## User Scenarios & Testing
- A dispatch staff logs a new shipment, generates an LR, and uploads required documents.
- A brokered vehicle is assigned, and a Hire Memo is created, capturing all financial and driver details.
- Tracking staff update daily vehicle status and receive E-way Bill expiry alerts.
- Accounts staff process POD receipt, flag it in the system, and initiate billing.
- Users group LRs for batch billing, add variable charges, and generate invoices with annexures.
- All cash/bank advances and balances are logged, and vouchers are generated.
- Admins manage master data for suppliers, brokers, and contracts.
- Role-based access ensures users only see and edit permitted data.

## Functional Requirements
1. **Centralized Dispatch Register**
   - Capture all shipment details at dispatch (LR No, Date, Consignor, Consignee, Qty, Vehicle No, Origin/Destination).
   - Allow digital uploads: LR, Party Invoice, E-way Bill.
2. **Hire Memo Management**
   - Generate Hire Memo for third-party vehicles, pulling data from Dispatch Register.
   - Capture total hire amount, advances (cash/bank), auto-calculate balance, and record driver details.
3. **Real-Time Tracking & Alerts**
   - Daily log for vehicle location and delivery status.
   - E-way Bill expiry monitoring with 8-hour pre-expiry alert if not delivered.
4. **Proof of Delivery (POD) Management**
   - Flag POD receipt for each LR.
   - Upload and archive digital POD, searchable by LR or Vehicle No.
5. **Billing & Annexure Generation**
   - Batch select LRs for single invoice.
   - Auto-generate annexure with LR details, vehicle numbers, and freight.
   - Allow manual addition of unloading, detention, and other charges.
6. **Voucher & Ledger Automation**
   - Generate print-ready debit vouchers for all advances/balances.
   - Auto-populate Bank Book and Cash Book from daily entries.
7. **Master Data Management**
   - Supplier/Broker Master: KYC, vehicle types, rate history (3-5 years).
   - Contract Master: Client-specific rates, validity, expiry alerts.
8. **Security & Access Control**
   - Role-based permissions: Dispatch, Tracking, Accounts.
   - Restrict financial data from non-accounts users.
9. **Reporting**
   - Generate pending billing report for unbilled LRs older than 15-20 days.
10. **Deployment & Transition**
    - Web/Desktop-first deployment.
    - Manual books maintained in parallel for initial 2-3 months.

## Success Criteria
- 100% of dispatches are logged digitally with all required fields and uploads.
- Hire Memo, tracking, POD, billing, and voucher workflows are fully digital and traceable.
- E-way Bill alerts trigger reliably before expiry.
- All master data is managed in-system, with no reliance on external/manual records.
- Role-based access prevents unauthorized data access.
- Reports and ledgers are generated automatically and accurately.
- Users can complete all primary flows without manual intervention.

## Key Entities
- LR (Lorry Receipt)
- Hire Memo
- Vehicle
- Consignor/Consignee
- Supplier/Broker
- Contract
- Invoice
- Voucher
- POD (Proof of Delivery)
- User (with Role)

## Implementation Gaps (as of Feb 2026)
- No UI for Hire Memo creation/management.
- No tracking dashboard or E-way Bill alert UI.
- No POD receipt/flagging or digital archive UI.
- No billing/invoice/annexure generation UI.
- No voucher or ledger UI.
- No Supplier/Broker or Contract Master screens.
- No role-based access control UI.
- No file upload UI for LR, Invoice, E-way Bill, or POD.
- No reporting UI for pending billing.

## Assumptions
- Standard web app UI/UX patterns will be used.
- File uploads will support PDF/JPG/PNG.
- Alerts will be via pop-up/modal.
- User roles: Dispatch, Tracking, Accounts, Admin.
- Data retention and security follow industry norms.

---

This spec is ready for planning. All major requirements and gaps are documented for a simple, complete implementation.