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

## Non-Functional Requirements

- **Financial Year Scoping**: All registers (Dispatch/LR, Hire Memo, Invoice, Payment Receipts, POD Management, Vouchers, Ledger Books, Reports) MUST be scoped by financial year (`YYYY-YY` format, e.g. `2025-26`). Every record that belongs to a register MUST carry a `financial_year` field. 
  - **UI Filter Standard**: Every register screen MUST provide a FY dropdown filter showing the current FY (default selection) plus the 3 immediately prior years. Example: if current date is March 2026, dropdown shows `2025-26` (default), `2024-25`, `2023-24`, `2022-23`.
  - FY runs April 1–March 31 (Indian financial year).
  - Changing the dropdown MUST reload the grid/list to show only records matching the selected FY via API `?fy=` query parameter.
- **Alerts**: E-way Bill pre-expiry alerts are surfaced as in-app banners/modals on the dashboard. Email/push notification deferred to v2.
- **File uploads**: PDF, JPG, PNG only; max 10 MB per file.
- **User roles**: Dispatch, Tracking, Accounts, Admin.

## Functional Requirements
1. **Centralized Dispatch Register**
   - Capture all shipment details at dispatch: LR No, Date, Consignor, Consignee, Qty, Vehicle No, Origin, Destination, FOB (linked to client Master), Through (Vendor/Broker), Bill No, Remarks.
   - Grid MUST display `driver_mobile` as a visible column (field exists in DB: `driver_mobile`).
   - E-way Bill No and E-way Bill Expiry Date MUST be editable inline in the grid (not read-only).
   - FOB field MUST link to client Master (not freeform city input).
   - All LR records MUST carry `financial_year`; grid MUST provide a FY filter.
   - Allow digital uploads: LR, client Invoice, E-way Bill.
2. **Hire Memo Management**
   - Generate Hire Memo for third-client vehicles, pulling data from Dispatch Register.
   - Hire Memo number MUST be auto-generated as a sequential series per financial year (no manual override, no duplicates). Format: integer sequence restarting at `1` each April 1.
   - Capture total hire amount, advances (cash/bank), auto-calculate balance, and record driver details.
   - Print output MUST produce **2 copies** on one page: "Original Copy" (top half) and "Book Copy" (bottom half), both carrying the same HM number.
   - Print output MUST include an "Amount in words" line (e.g., "Rupees One Lakh Five Thousand Only").
   - All Hire Memo records MUST carry `financial_year`.
   - A Hire Memo Register (list/grid view) MUST be available with FY filter.
3. **Real-Time Tracking & Alerts**
   - Daily log for vehicle location and delivery status.
   - E-way Bill expiry monitoring with 8-hour pre-expiry in-app alert if not delivered.
4. **Proof of Delivery (POD) Management**
   - Flag POD receipt for each LR.
   - Upload and archive digital POD, searchable by LR or Vehicle No.
5. **Billing & Invoice Register**
   - **Invoice Register grid** columns (in order): BILL_NO, BILL_DATE, LR_NO, LR_DATE, ORIGIN, DESTINATION, CUSTOMER, AMOUNT, AMOUNT_PASSED, DEDUCTIONS, TDS_AMOUNT, NET_AMOUNT, REMARKS, CM_NO, CM_DATE.
   - `NET_AMOUNT` MUST be computed as `AMOUNT_PASSED − TDS_AMOUNT` and displayed read-only.
   - Invoice Register MUST support a **per-client tab/filter** view (each client's invoices isolated, mirroring the Bill Notebook structure of one sheet per client).
   - Invoice Register MUST display a running **outstanding total** (sum of unpaid invoices) per client.
   - **Invoice numbering** MUST be auto-generated: sequential integer per financial year, format `{seq}/{YY}-{YY+1}` (e.g., `1543/25-26`). Sequence resets to 1 on April 1. No manual override.
   - All invoice records MUST carry `financial_year`.
   - **Invoice PDF fields** (required for generation):
     - Company header: name, PAN, GSTIN, address, bank details (ICICI Bank, Branch, IFSC, A/c No.).
     - BILL TO: client name, address, GSTIN (from client Master).
     - Invoice No. (auto-generated), Invoice Date.
     - PO NUMBER and PO DATE (client purchase order reference).
     - HSN Code: `996791` (standard transport services code, mandatory for GST compliance).
     - Line items: S.NO, LR NO, DATE, QTY/NOS, PARTICULARS, V.TYPE, VEHICLE NO., C'GNR (Consignor), C'GNEE (Consignee), FROM, TO, FREIGHT, LOADING DETENTION, UNLOADING CHARGES, UNLOADING DETENTION, OTHER CHARGES, TOTAL.
     - Deduction lines (e.g., SEAL COST) as separate line items.
     - Amount total and "Amount in words" line.
     - Reverse charge fields: `gst_paid_by` (client name) and `tax_on_reverse_charge` (YES/NO boolean). Sample shows "GST PAYABLE BY [CLIENT NAME]" and "TAX PAYABLE ON REVERSE CHARGES: YES".
     - Authorised Signatory section.
   - Batch-select LRs for a single invoice; auto-generate annexure PDF.
   - Allow manual addition of unloading, detention, and other charges per LR line.
6. **Payment Receipts Register**
   - A dedicated screen to record payments received from clients.
   - Columns: PAYMENT DATE, AMOUNT, RECEIVED FROM (client name), NOTES (optional).
   - New route: `/payment-receipts`; model: `PaymentReceipt(id, payment_date, amount, received_from, financial_year, notes)`.
   - All records MUST carry `financial_year`; UI MUST provide a FY filter.
   - This register is separate from invoice passing (Amount Passed in Invoice Register) and records the actual cash/bank receipt event.
7. **Voucher & Ledger Automation**
   - Generate print-ready debit vouchers for all advances/balances.
   - Auto-populate Bank Book and Cash Book from daily entries.
8. **Master Data Management**
   - **client Master** (Client/Consignor/Consignee): name, address, GSTIN, contact details.
   - **Vendor/Broker Master**: KYC, vehicle types, rate history. NOTE: Vendor/Broker does NOT have a GSTIN field. Drop `gstin` from vendor model if present.
   - **Contract Master**: Client-specific rates, validity, expiry alerts.
9. **Security & Access Control**
   - Role-based permissions: Dispatch, Tracking, Accounts, Admin.
   - Restrict financial data (billing, payments, vouchers) from non-Accounts users.
10. **Reporting**
    - Pending billing report: unbilled LRs older than 15–20 days.
    - Outstanding receivables report: unpaid invoices per client with total outstanding.
11. **Deployment & Transition**
    - Web/Desktop-first deployment.
    - Manual books maintained in parallel for initial 2–3 months.

## Success Criteria
- 100% of dispatches are logged digitally with all required fields and uploads.
- Hire Memo, tracking, POD, billing, and voucher workflows are fully digital and traceable.
- E-way Bill alerts trigger reliably before expiry.
- All master data is managed in-system, with no reliance on external/manual records.
- Role-based access prevents unauthorized data access.
- Reports and ledgers are generated automatically and accurately.
- Users can complete all primary flows without manual intervention.

## Key Entities
- LR (Lorry Receipt) — carries `financial_year`
- Hire Memo — carries `financial_year`; auto-numbered per FY
- Vehicle
- client (Consignor/Consignee/Client) — has GSTIN
- Vendor/Broker — NO GSTIN field
- Contract
- Invoice — carries `financial_year`; auto-numbered `{seq}/{YY}-{YY+1}`; has `tds_amount`, `net_amount`, `po_no`, `po_date`, `reverse_charge`, `gst_paid_by`, `hsn_code`
- PaymentReceipt — carries `financial_year`; records actual cash/bank receipts from clients
- Voucher
- POD (Proof of Delivery)
- User (with Role)

## Implementation Gaps (as of Mar 2026)
- No UI for Hire Memo creation/management.
- No tracking dashboard or E-way Bill alert UI.
- No POD receipt/flagging or digital archive UI.
- No billing/invoice/annexure generation UI.
- No voucher or ledger UI.
- No Supplier/Broker or Contract Master screens.
- No role-based access control UI.
- No file upload UI for LR, Invoice, E-way Bill, or POD.
- No reporting UI for pending billing.
- **Payment Receipts Register entirely absent** (new FR6 — no model, API, or UI).
- **`financial_year` field absent** from LR, HireMemo, and Invoice DB models.
- **TDS_AMOUNT and NET_AMOUNT absent** from Invoice Register (BillBook) model and UI.
- **Invoice auto-numbering not implemented** (format `{seq}/YY-YY`).
- **Hire Memo auto-numbering not enforced** and 2-copy print is not implemented.
- **`driver_mobile` not shown** in Dispatch Register grid.
- **Vendor GSTIN field must be removed** (Vendor/Broker has no GSTIN).
- **Invoice annexure column structure not fully defined** in previous spec.
- **PO_NUMBER, PO_DATE, reverse_charge, HSN_CODE absent** from Invoice model.
- **Per-client tab/filter absent** from Invoice Register UI.

## Assumptions
- Standard web app UI/UX patterns will be used.
- File uploads will support PDF/JPG/PNG, max 10 MB.
- E-way Bill alerts are in-app banners/modals (email deferred to v2).
- User roles: Dispatch, Tracking, Accounts, Admin.
- Financial year runs April 1 – March 31. Current FY is 2025-26.
- TDS rate is a configurable per-client value (not hardcoded).
- "Amount in words" applies to INR amounts for both Hire Memo and Invoice prints.
- HSN Code `996791` is used for all transport service invoices.
- FOB in Dispatch Register links to client Master (consignor only); free text is not allowed.
- Data retention and security follow industry norms.

---

This spec is updated as of Mar 2026 to encode all gaps identified from sample documents and client review with Nikhil. All critical findings from `COMPREHENSIVE_GAP_ANALYSIS.md` are now reflected here.