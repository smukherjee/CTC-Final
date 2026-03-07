# CTC Logistics Management System - Implementation Plan (Phase 1)

**Goal:** Build a centralized, simple, and visually premium web application for CTC Logistics to manage LRs, POD Verification, Invoices, and Petty Cash.
**Strategy:** "Design First" + "Strict Business Rules" + "Simple Integrations".

## User Review Required
> [!IMPORTANT]
> **Tally Integration Strategy:**
> We are proceeding with **Excel/CSV Ingestion** for data exchange.
> - **App -> Tally**: Invoices generated in App will be exportable to Excel for import into Tally.
> - **Tally -> App**: Payment/Receipt statuses or Master updates will be ingested via Excel upload into the App.
>
> **Printer Hardware:**
> - System is designed for **Laser Printers (A4)**. Legacy Dot Matrix stationery will NOT work with this logic.

## Technology Stack
- **Frontend:** React 19 (or Latest Stable LTS), TailwindCSS
- **UI Framework:** Shadcn/UI + Lucide Icons (Premium, clean aesthetic)
- **Data Grid:** AG Grid Community (Best for Excel-like features)
- **State Management:** TanStack Query (React Query) + Zustand
- **Printing/Reporting:** Handlebars.js + DOMPurify (HTML-based templating)
- **Data Handling:** `xlsx` for Excel parsing

## Proposed Architecture (Phase 1)

### 1. Data Models (Core)
- **User:** `id, role, name, branch_id`
- **client (Customer):** `id, name, address, type (CONSIGNOR/CONSIGNEE/BOTH)`
    - *Note: Single master table for both Consignors and Consignees.*
- **Vendor (Supplier):** `id, name, kyc_docs (JSON), rating, vehicle_history` (For Brokers/Owners)
- **Contract:** `id, client_id, origin, destination, rate, validity_start, validity_end`
- **Vehicle:** `id, number, type, capacity, owner_id (Vendor), status (AVAILABLE, IN_TRANSIT)`
- **Dispatch (Trip):** `id, vehicle_id, driver_id, start_date, expected_delivery_date, status, lrs[]`
    - `status` enum: `SCHEDULED`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`
- **DocumentTemplate:** `id, name, content_html, type (LR/INVOICE/VOUCHER)` (Stores the user-modifiable layout)
- **EWayBill:** `id, number, valid_from, valid_upto, status (ACTIVE/EXPIRED), alert_sent (bool)`
    - *Note: Independent entity linked to LRs.*
- **LR (Consignment):** `id, number, date (manual_override), dispatch_id, consignor_id, consignee_id, eway_bill_id, articles_count, articles_description, weight, freight_amount, fob (terms), through (broker_code), status`
    - `status` enum: `DRAFT`, `DISPATCHED`, `DELIVERED`, `POD_UPLOADED`, `POD_VERIFIED`, `BILLED`
- **POD:** `lr_id, image_url, verified_by, verified_at`
    - **Capture:** Camera Capture (Mobile) or File Attachment (Desktop).
- **Invoice:** `id, customer_id, amount_billed, amount_passed, deductions, status, tally_ref_id (Optional)`
- **PettyCash:** `id, transaction_type, amount, balance_after, related_entity_id (LR/HireMemo)`
    - **Alert:** Report/Dashboard Warning if Balance < Threshold (e.g., ₹5000).

### 2. Feature Modules

#### [MODULE] Operations (The Core)
*   **Dispatch Register (Home Screen):**
    *   **Concept:** The central command center. **AG Grid** implementation for high performance and Excel features.
    *   **Features:**
        *   **Excel-like Filtering:** Column menu filters.
        *   **Row Grouping:** Group by Status or Vehicle (if needed).
        *   **Keyboard Navigation:** Arrow keys to move between cells.
        *   **Columns:** Date, LR #, Consignor, Consignee, Vehicle, Description, FOB, Through, Status, E-Way Expiry.
        *   **Alerts:** Rows highlighted in **RED** if `E-Way Expiry < Trip.ExpectedDelivery`.
    *   **Actions:** Right-click or Context Menu to -> "Record Delivery", "Bill", "View POD".
*   **LR Creation Wizard:**
    *   Clean multi-step form: Pick Customer (from Client Master) -> Enter Goods -> Assign Vehicle.
    *   **E-Way Bill Tracking & Alerts (Background Service):**
        *   **File Uploads (Mandatory):** Upload LR image, client Invoice, and E-Way Bill at creation time.
        *   **Entity Logic:** E-Way Bill is an independent entity attached to the LR.
        *   **Validation Warning:** If `Valid Upto < Trip.ExpectedDelivery`, show "Risk of Expiry" warning immediately during creation.
        *   **Alert Logic (Cron Job):** Runs every 30 mins.
            *   **Query:** `EWayBill.Status != 'DELIVERED'` AND `Expiry <= NOW() + 8 Hours`.
            *   **Action:** Triggers a **Toast Warning** on the Dashboard and sends a notification to the Operations Manager.
    *   **Vehicle Availability Logic:**
        *   Dropdown only shows vehicles with `status = AVAILABLE`.
        *   **Date Overlap Check:** Database query `WHERE vehicle_id = ? AND status = 'IN_TRANSIT'` must return 0 records before assignment.
    *   **Printing:**
        *   Fetches the active 'LR Template' from DB.
        *   Merges data using Handlebars (`{{consignor.name}}`).
        *   Opens a print-friendly window.
*   **Debit Vouchers:**
    *   **Requirement:** Print-ready vouchers for all payments.
    *   **Flow:** When `Hire Memo` advance is saved (Cash/Bank), allow one-click "Print Voucher".
    *   **Template:** Uses Handlebars template `DEBIT_VOUCHER`.
*   **Template Editor (Settings):**
    *   Simple text/code editor where Admin can modify the HTML structure of Invoices/LRs/Vouchers.
    *   Provides a "Preview" button with dummy data.
*   **Hire Memo:**
    *   Calculate Driver Advance.
    *   **Logic:** If `PaymentMode == 'CASH'`, trigger atomic Petty Cash deduction.
    *   **Warning:** Show "Low Balance" alert if Petty Cash drops below configured threshold.

#### [MODULE] Finance (Accounts)
*   **POD Verification Inbox (Gatekeeper):**
    *   List all LRs with `status = DELIVERED`.
    *   Left Split: List of LRs | Right Split: POD Image Preview + "Verify" button.
    *   Action: Verification unlocks the `Ready for Billing` status.
*   **Invoice Generation:**
    *   **Constraint:** ONLY show LRs where `status = POD_VERIFIED`.
    *   **Smart Features:**
        *   **Annexure:** Auto-generate a detailed table listing all LRs included in this invoice.
        *   **Ad-hoc Charges:** Button to add "Unloading/Detention" line items.
        *   **Contract Rates:** Pull rate from `Contract Master` based on Route (Origin/Dest).
    *   Selection Data Grid: Multi-select LRs -> "Generate Invoice".
*   **[NEW MODULE] Data Migration & Import (Centralized):**
    *   **Architecture:** Reusable `ExcelImportComponent` handling parsing, validation, and feedback.
    *   **Features:**
        *   **Template Download:** "Download Template" button for every Master (client, Vendor, Vehicle, Contract).
        *   **Dry-Run Validation:** UI parses Excel client-side -> Validates against Schema -> Shows Error Grid (e.g., "Row 4: Invalid Mobile").
        *   **Bulk Insert:** Only allows commit if dry-run passes (or user actively ignores warnings).
    *   **Scope:** All Master Data (Customers, Vendors, Vehicles, Drivers, Contracts).
*   **Excel Ingestion (Transactional):**
    *   Simple UI to upload `.xlsx` for Tally Logic.
    *   Parser map: `Column A (TallyRef) -> DB Column`.

#### [MODULE] Dashboard & Tracking
*   **Premium Dashboard:**
    *   Visual counters: "Pending verification", "Unbilled Amount", "Cash Balance".
    *   Charts: "Daily Dispatch Volume" (Simple Bar chart).

## Implementation Steps

### Phase 1: Foundation
- [ ] Initialize Project (Vite + Tailwind + TypeScript)
- [ ] Setup UI System (Shadcn/UI, Fonts: Inter/Outfit)
- [ ] Create Navigation Layout (Sidebar with Role-based visibility)

### Phase 2: Operations & Printing
- [ ] Implement `LR Creation Form`
- [ ] Implement `PDF Generator` Service (LR Template)
- [ ] Implement `Hire Memo` with Mock Petty Cash logic

### Phase 3: The Gatekeeper (POD & Billings)
- [ ] Implement `POD Verification` Screen (Image Viewer + Approve/Reject)
- [ ] Implement `Invoice Generation` (Filtering verified LRs only)
- [ ] Implement `Billing Block` Logic (Route protection)

### Phase 4: Data Import/Export
- [ ] Build `ExcelUpload` Component (Drag & Drop)
- [ ] Implement Tally mapping logic

## Verification Plan

### Automated Tests
- **Unit:** Test the "Gatekeeper" logic (ensure Invoice cannot be generated if POD is missing).
- **Unit:** Test Petty Cash math (ensure deduction works correctly).

### Manual Verification
- **Printing:** Generate a PDF LR and inspect alignment.
- **Data Load:** Upload a sample Tally Excel export and verify fields match.
