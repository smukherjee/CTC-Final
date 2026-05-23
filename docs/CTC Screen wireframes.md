This document contains high-fidelity textual wireframes representing the screens defined in the UI/UX Design Specifications v1.1. It concludes with a screen flow diagram illustrating the user journeys.

**Note on interpreting these wireframes:**
These are high-fidelity textual representations.

* `[...]` denotes buttons or clickable actions.
* `Input[ Placeholder ]` denotes text input fields.
* `▼` denotes a dropdown menu.
* `[x]` or `[ ]` denotes checkboxes.
* `🔒` denotes the Tally lock indicator.
* Layouts emphasize data density for desktop versus card views for mobile.

---

### GLOBAL DESKTOP LAYOUT (Wrapper for PWA)

```text
+-----------------------------------------------------------------------------------------------------+
| CTC LOGISTICS ERP  |  🔍 Global Search...    | 🔔 [3] |  👤 Rahul (Dispatch) ▼                      |
+-----------------------------------------------------------------------------------------------------+
| DASHBOARD      |                                                                                    |
| DISPATCH       |  [MAIN CONTENT AREA - Changes based on selected screen]                            |
|  > Smart Grid  |                                                                                    |
|  > Hire Memo   |                                                                                    |
| TRACKING       |                                                                                    |
| ACCOUNTS       |                                                                                    |
| MASTERS        |                                                                                    |
|                |                                                                                    |
| ⚙️ Settings     |                                                                                    |
+----------------+------------------------------------------------------------------------------------+

```

---

### SCR-010: DISPATCH SMART GRID (High-Speed Entry)

**Context:** Desktop PWA. Ultra-dense grid meant for keyboard-only data entry.

```text
+-----------------------------------------------------------------------------------------------------+
| DISPATCH SMART GRID                                          [+ New Hire Memo]  [Save All (Ctrl+S)] |
+-----------------------------------------------------------------------------------------------------+
| BOOK: MUM/2024 | Range: 1001-2000 | Next Available: 1046                            Unsaved Changes: 2|
+-----------------------------------------------------------------------------------------------------+
| FROZEN COLUMNS || SCROLLABLE COLUMNS >>>                                                            |
| Status | Date  || Customer (Consignor)| Consignee   | Origin | Dest   | Mat. Desc | Pkgs | Wgt (MT)|
+--------+-------||---------------------|-------------|--------|--------|-----------|------|---------|
| Draft  | 26-01 || Input[Havells In...]▼| Input[ABC..]▼| Delhi ▼| Mumbai▼| Elec. P...| 50   | 15.500  | <-- Editing
+--------+-------||---------------------|-------------|--------|--------|-----------|------|---------|
| Draft  | 26-01 || Havells India Ltd   | XYZ Traders | Delhi  | Pune   | Cables    | 100  | 22.000  |
+--------+-------||---------------------|-------------|--------|--------|-----------|------|---------|
| Hired  | 25-01 || LG Electronics      | Vijay Sales | Mumbai | Nagpur | Washers   | 40   | 12.000  |
+--------+-------||---------------------|-------------|--------|--------|-----------|------|---------|
| Void   | 25-01 || --                  | --          | --     | --     | --        | --   | --      |
+--------+-------||---------------------|-------------|--------|--------|-----------|------|---------|
| Draft  | 26-01 || Input[           ]▼ | Input[     ]▼| ...    | ...    | ...       | ...  | ...     | <-- New Row
+--------+-------||---------------------|-------------|--------|--------|-----------|------|---------|

NOTE: Rows are ultra-compact (e.g., 28px height).
Focus indicator is a sharp blue border around the active cell.
Keyboard Interaction: Tab/Enter moves focus instantly.
Context Menu Key opens row actions (Mark Void) without mouse.

```
---

### SCR-015: Lorry Receipt (LR) Detail View (Desktop Mode)

**Context:** Desktop PWA. Three-panel structure for linking LRs and calculating financials.

```text
+-----------------------------------------------------------------------------------------------------+
| LR DETAILS: 1000001                                                    [🖨️ Print PDF]  [✖ Close]   |
+-----------------------------------------------------------------------------------------------------+
|                                                                                                     |
|  CTC LOGISTICS PVT. LTD.                                          LR No:  1000001                   |
|  [Company Reg/Address info...]                                    Date:   12/05/2024                |
|                                                                                                     |
+-----------------------------------------------------------------------------------------------------+
|  VEHICLE & ROUTE                                                                                    |
|  Truck No:  HR 55 X 1234             Type: 32ft MXL                                                 |
|  Origin:    Delhi                    Destination: Mumbai                                            |
+-----------------------------------------------------------------------------------------------------+
|                                                                                                     |
|  CONSIGNOR (Sender)                         CONSIGNEE (Receiver)                                    |
|  +---------------------------------------+  +----------------------------------------------------+  |
|  | Havells India Ltd                     |  | Havells India Ltd (Mumbai Depot)                   |  |
|  | [Address Line 1...]                   |  | [Address Line 1...]                                |  |
|  | GSTIN: 07AAACH1234F1Z5                |  | GSTIN: 27AAACH1234F1Z5                             |  |
|  +---------------------------------------+  +----------------------------------------------------+  |
|                                                                                                     |
+-----------------------------------------------------------------------------------------------------+
|  GOODS DETAILS                                                                                      |
|  +-----------------------------------------------------------------------------------------------+  |
|  | Pkgs  | Packing Type | Description of Goods                    | Weight (MT) | Freight Basis    |  |
|  |-------|--------------|-----------------------------------------|-------------|------------------|  |
|  | 50    | Boxes        | Electronic Panels & Components          | 15.500      | Per MT           |  |
|  +-----------------------------------------------------------------------------------------------+  |
|                                                                                                     |
+-----------------------------------------------------------------------------------------------------+
|  FREIGHT & TAX DETAILS (View restricted to authorised roles)                                        |
|  +--------------------------------------------------------------------+                             |
|  | Client Freight Rate: ₹ 3,500 / MT                                  |                             |
|  |                                                                    |                             |
|  | GST Liability:                                                     |                             |
|  | [x] Consignor to Pay   [ ] Consignee to Pay (RCM)                  |                             |
|  +--------------------------------------------------------------------+                             |
|                                                                                                     |
+-----------------------------------------------------------------------------------------------------+
|  FOOTER                                                                                             |
|  Remarks: Gate entry required before 6 PM.                                                          |
|                                                                                                     |
|  TERMS & CONDITIONS:                                                                                |
|  1. Goods carried at owner's risk... [Standard legal text]                                          |
|                                                                                                     |
|  For CTC LOGISTICS PVT. LTD.                                                                        |
|                                                                                                     |
|  ___________________________                                                                        |
|  (Authorised Signatory)                                                                             |
+-----------------------------------------------------------------------------------------------------+
```
---

---

### SCR-020: HIRE MEMO CREATION (Vehicle Hiring)

**Context:** Desktop PWA. Three-panel structure for linking LRs and calculating financials.

```text
+-----------------------------------------------------------------------------------------------------+
| NEW HIRE MEMO                                                                           [< Back]    |
+-----------------------------------------------------------------------------------------------------+
| 1. VEHICLE & VENDOR DETAILS                                                                         |
| +-------------------------------------------------------------------------------------------------+ |
| | Hire Date: Input[26-01-2026]  Vehicle No: Input[HR55X...]▼ (32ft MXL)                           | |
| | Vendor:    Input[Sharma Transports]▼  [BADGE: TDS Rate: 2% (Standard)]                          | |
| +-------------------------------------------------------------------------------------------------+ |
|                                                                                                     |
| 2. SHIPMENTS TO LOAD                                                               [+ Add LRs]      |
| +-------------------------------------------------------------------------------------------------+ |
| | [x] LR No | Customer      | Destination | Weight  |                                               | |
| | [x] 1045  | Havells India | Mumbai      | 15.5 MT |                                               | |
| | [x] 1046  | Havells India | Pune        | 22.0 MT |                                               | |
| |-------------------------------------------------|                                               | |
| | Total Loaded Weight: 37.5 MT                    |                                               | |
| +-------------------------------------------------------------------------------------------------+ |
|                                                                                                     |
| 3. FINANCIAL CALCULATION (The Calculator)                                                           |
| +-------------------------------------------------------------------------------------------------+ |
| | A. VENDOR FREIGHT                                                                               | |
| | Hire Rate Basis: [Fixed ▼]  Rate: Input[ 85000 ]    Total Lorry Hire (A):             ₹ 85,000  | |
| |                                                                                                 | |
| | B. DEDUCTIONS                                                                                   | |
| | Less: TDS (2% of A):                                                                - ₹  1,700  | |
| | Other Deductions: Input[ 0    ] Reason: Input[ ]                                    - ₹      0  | |
| |                                                                                                 | |
| | C. ADVANCE PAYMENT                                                                              | |
| | Advance Amount: Input[ 20000 ]                                                      - ₹ 20,000  | |
| | Payment Mode: [Cash (HO Petty Cash) ▼]  Ref No: Input[PC-Slip-102]                              | |
| | ----------------------------------------------------------------------------------------------- | |
| | D. FINAL TOTALS                                                                                 | |
| |                                                     BALANCE PAYABLE (To Broker):      ₹ 63,300  | |
| +-------------------------------------------------------------------------------------------------+ |
|                                                                                                     |
|                                                    [Save Draft] [FINALIZE HIRE MEMO & PAY ADVANCE]  |
+-----------------------------------------------------------------------------------------------------+

```

---

### SCR-035: MOBILE TRIP CARD VIEW (Field Tracking)

**Context:** Mobile Device (<768px). Read-only view optimized for quick status checks and updates in the field.

```text
+-----------------------------------------+
| ≡  CTC TRACKING           🔍     👤     |
+-----------------------------------------+
| Active Trips                            |
|                                         |
| +-------------------------------------+ |
| | LR #1045         [IN-TRANSIT (Amber)] | | <-- Card 1
| |-------------------------------------| |
| | Delhi ➔ Mumbai                      | |
| | Customer: Havells India             | |
| | Truck: HR 55 X 1234                 | |
| |                                     | |
| | Latest Remark:                      | |
| | Crossed Jaipur border @ 10AM today. | |
| +-------------------------------------+ |
|                                         |
| +-------------------------------------+ |
| | LR #1042         [DELIVERED (Green)]| | <-- Card 2
| |-------------------------------------| |
| | Delhi ➔ Nagpur                      | |
| | Customer: LG Electronics            | |
| | Truck: MH 12 AB 9988                | |
| |                                     | |
| | Latest Remark:                      | |
| | Unloading started at client warehouse.| |
| +-------------------------------------+ |
|                                         |
| (Tap a card to open detail/upload view) |
+-----------------------------------------+

```

---

### SCR-050: POD VERIFICATION INBOX

**Context:** Desktop PWA. Split-screen for Accounts to verify digital vs. physical documents.

```text
+-----------------------------------------------------------------------------------------------------+
| POD VERIFICATION INBOX                                                        Filter: [All Status ▼]|
+-----------------------------------------------------------------------------------------------------+
| PENDING LIST (Left Panel 40%)       | VERIFICATION WORKSPACE (Right Panel 60%)                      |
|-------------------------------------|---------------------------------------------------------------|
| LR 1030 | LG Elec. | 24-01-26       | TRIP SUMMARY: LR 1030 | LG Electronics | Delhi -> Nagpur      |
| [Scan Pending Review (Yellow)]      |                                                               |
|-------------------------------------| DIGITAL SCAN VIEWER:                                          |
| LR 1025 | Havells  | 23-01-26       | +-----------------------------------------------------------+ |
| [Scan Rejected (Red)]               | |                                                           | |
|-------------------------------------| |  [ IMAGE PLACEHOLDER: SCANNED LR WITH STAMPS/SIGNATURE ]  | |
|                                     | |                                                           | |
|                                     | |                                                           | |
|                                     | +-----------------------------------------------------------+ |
|                                     | [Zoom In] [Zoom Out] [Rotate] [Download]                      |
|                                     |                                                               |
|                                     | VERIFICATION CHECKS:                                          |
|                                     | 1. Is digital scan clear?       (•) Yes | ( ) No (Reject)     |
|                                     |                                                               |
|                                     | 2. CRITICAL: PHYSICAL COPY RECEIVED?                          |
|                                     | +-----------------------------------------------------------+ |
|                                     | | [x] YES, Original Paper Copy Received & Verified          | |
|                                     | | (Ticking this unlocks billing for this trip)              | |
|                                     | +-----------------------------------------------------------+ |
|                                     |                                                               |
|                                     |                                     [CONFIRM & UNLOCK BILLING]|
+-------------------------------------+---------------------------------------------------------------+

SUCCESS STATE OVERLAY (After clicking Confirm):
+-----------------------------------------------------------------------+
| ✅ SUCCESS                                                            |
| POD Verified for LR 1030. Billing is now unlocked.                    |
|                                                                       |
| [ Stay Here ]                           [ GENERATE INVOICE NOW -> ]   |
+-----------------------------------------------------------------------+

```

---

### SCR-080: HO PETTY CASH LEDGER

**Context:** Desktop PWA. Accounts role managing physical cash at Head Office.

```text
+-----------------------------------------------------------------------------------------------------+
| HO PETTY CASH LEDGER                                                                                |
+-----------------------------------------------------------------------------------------------------+
| CURRENT CASH ON HAND:  ₹ 45,500                                                                     |
| (Last Reconciled: Today 9:00 AM)                                           [+ Record Bank Deposit]  |
+-----------------------------------------------------------------------------------------------------+
| RECENT TRANSACTIONS                                                                                 |
| Date/Time       | Type             | Description / Ref       | Money In (+) | Money Out (-) | Bal.  |
|-----------------|------------------|-------------------------|--------------|---------------|-------|
| 26-01 11:30 AM  | ↓ Advance Paid   | Hire Memo #HM-559       | --           | ₹ 20,000 (Red)| 45,500|
| 26-01 10:15 AM  | ↓ Advance Paid   | Hire Memo #HM-558       | --           | ₹ 15,000 (Red)| 65,500|
| 26-01 09:30 AM  | ↑ Bank Deposit   | Withdrawal Ref #88745   | ₹ 50,000 (Gr)| --            | 80,500|
| 25-01 06:00 PM  | ↓ Expense        | Office Supplies / Bill2 | --           | ₹    500 (Red)| 30,500|
+-----------------|------------------|-------------------------|--------------|---------------|-------|
| ...                                                                                                 |
+-----------------------------------------------------------------------------------------------------+

```

---

### SCR-090: MASTER DATA MANAGE (Showing Tally Lock)

**Context:** Desktop PWA. Admin viewing a customer record synced with Tally.

```text
+-----------------------------------------------------------------------------------------------------+
| EDIT CUSTOMER: HAVELLS INDIA LTD                                                  [Cancel] [Save]   |
+-----------------------------------------------------------------------------------------------------+
|                                                                                                     |
|  Customer Name:   Input[ Havells India Ltd ] 🔒                                                     |
|                   (Tooltip on hover: "Locked by Tally Sync. Editing disabled.")                     |
|                                                                                                     |
|  Tally Ledger Name: [ Havells India Ltd - Sundry Debtor ] (Read Only)                               |
|                                                                                                     |
|  GSTIN:           Input[ 07AAACH1234F1Z5 ]                                                          |
|  PAN:             Input[ AAACH1234F ]                                                               |
|                                                                                                     |
|  Billing Address: TextArea[ Plot No 1, Industrial Area,                                             |
|                             New Delhi - 110020 ]                                                    |
|                                                                                                     |
|  Primary Contact: Input[ Mr. Sharma ]                                                               |
|  Phone/Mobile:    Input[ 9811098110 ]                                                               |
|                                                                                                     |
|  Default Terms:   [ To Pay ▼ ]                                                                      |
+-----------------------------------------------------------------------------------------------------+

```

---

### SCREEN FLOW DIAGRAM

This diagram illustrates the primary user journeys across the defined screens.

```mermaid
graph TD
    User((User))

    subgraph "HO Desktop (PWA)"
    Dashboard[Dashboard]
    SCR010[SCR-010: Dispatch Smart Grid]
    SCR-015: Lorry Receipt (LR) Detail View (Desktop Mode)
    SCR020[SCR-020: Hire Memo Creation]
    SCR050[SCR-050: POD Verification Inbox]
    SCR060[SCR-060: Invoice Generation]
    SCR080[SCR-080: HO Petty Cash Ledger]
    Tally[(Tally Accounting)]
    end

    subgraph "Field Mobile"
    SCR035[SCR-035: Mobile Trip Card View]
    UploadPOD[Upload POD Scan Detail View]
    end

    %% Main Logistics Flow
    User --> Dashboard
    Dashboard -->|Dispatch Exec| SCR010
    SCR010 -->|Create Hire Memo| SCR020
    SCR020 -->|Finalize Trip| SCR035
    SCR035 -->|Tracking Exec updates| UploadPOD
    UploadPOD -->|Scan Uploaded| SCR050
    SCR050 -->|Accounts Exec Verifies Physical Copy| SCR050
    SCR050 -->|Success: Generate Invoice Now| SCR060
    SCR060 -->|Finalize Bill| Tally

    %% Financial Sub-Flow
    SCR020 -->|If 'Cash Advance' selected| SCR080
    SCR080 -->|Auto-deducts balance| SCR020
    Dashboard -->|Accounts Exec manages cash| SCR080

    %% Style definitions for the diagram
    classDef desktop fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef mobile fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef external fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;

    class Dashboard,SCR010,SCR020,SCR050,SCR060,SCR080 desktop;
    class SCR035,UploadPOD mobile;
    class Tally external;

```