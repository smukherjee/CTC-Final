# UI/UX DESIGN SPECIFICATION: CTC LOGISTICS SYSTEM

## 1. USER PERSONAS

### Persona 1: The Dispatch Executive (DE)

* **Name:** Rahul
* **Role:** Senior Dispatch Executive (HO Operations)
* **Goals:** Process 50+ LRs daily with zero errors, ensure every physical LR number is accounted for, hire trucks quickly.
* **Pain Points:** Hate slow web forms that require mouse clicks. Used to the speed of Excel and Tally. Frustrated by re-typing data.
* **Technical Proficiency:** High with keyboard shortcuts and data entry. Low tolerance for complex UIs.
* **Usage Context:** Desktop computer in a busy, noisy Head Office. Uses two monitors.
* **Key Tasks:**
1. High-speed entry of LRs (US-2.01).
2. Creating Hire Memos and calculating advances (US-3.01).
3. Managing physical stationery inventory (US-2.02).



### Persona 2: The Tracking Executive (TE)

* **Name:** Priya
* **Role:** Tracking Executive (Operations)
* **Goals:** Get accurate daily location updates from drivers, upload clear POD scans immediately upon delivery.
* **Pain Points:** Drivers not picking up phones, blurry photos sent via WhatsApp, slow internet when working from home or border offices.
* **Technical Proficiency:** Moderate. Comfortable with smartphones and basic web apps.
* **Usage Context:** Mix of desktop at HO and mobile/tablet while on the move or working remotely.
* **Key Tasks:**
1. Updating trip status and remarks daily.
2. Uploading digital POD scans (US-4.01).
3. Viewing trip details on mobile (US-6.02).



### Persona 3: The Accounts Clerk (AC)

* **Name:** Suresh
* **Role:** Senior Accounts Clerk (Finance)
* **Goals:** Ensure 100% match between physical PODs and invoices, prevent billing errors, ensure Tally sync works perfectly.
* **Pain Points:** Chasing operations for missing PODs, clients rejecting bills due to discrepancies, manual reconciliation with Tally.
* **Technical Proficiency:** High with Tally and Excel. Detail-oriented.
* **Usage Context:** Desktop computer in a quiet Finance cabin.
* **Key Tasks:**
1. Verifying physical PODs against digital scans (US-4.02).
2. Generating Invoices and Annexures (US-5.01).
3. Managing Tally sync and recording short payments.



### Persona 4: The Admin/Manager (AM)

* **Name:** Abhishek
* **Role:** Business Owner / Admin
* **Goals:** Maintain overall process discipline, prevent fraud through audit trails, ensure master data integrity.
* **Pain Points:** Unauthorized backdating of entries, rate manipulation by staff, duplicate master data creating Tally issues.
* **Technical Proficiency:** High business acumen, moderate technical skill.
* **Usage Context:** Laptop and high-end smartphone, often traveling.
* **Key Tasks:**
1. Approving ad-hoc charges (US-3.02).
2. Managing Master Data with Tally lock (US-1.01).
3. Reviewing audit logs for critical changes (US-6.01).



---

## 2. INFORMATION ARCHITECTURE

### Primary Navigation Structure (PWA Desktop Sidebar)

1. **Dashboard:** Overview of daily ops, pending tasks, and key metrics.
2. **Dispatch:**
* New LR Entry (Smart Grid)
* Hire Memo / Vehicle Hiring
* Dispatch Register (View All)


3. **Tracking:**
* Active Trips
* Update Status
* POD Upload Pending


4. **Accounts:**
* POD Verification Inbox
* Generate Invoice
* Invoice Register (Bill Notebook)


5. **Masters:** (Admin Only)
* Customers
* Vendors (Brokers/Owners)
* Vehicles
* Routes
* Stationery Books



### Screen Inventory (Partial List for Phase 1)

| Screen ID | Screen Name | Primary User Role | Core Function | Related Stories |
| --- | --- | --- | --- | --- |
| **SCR-010** | **Dispatch Smart Grid** | Dispatch Exec | High-speed LR creation | US-2.01, US-2.02 |
| **SCR-020** | **Hire Memo Creation** | Dispatch Exec | Hiring truck & calculating advance | US-3.01, US-3.02 |
| **SCR-030** | **Active Trip Tracking** | Tracking Exec | Daily status updates | N/A |
| **SCR-035** | **Mobile Trip Card View** | Tracking Exec (Field) | Mobile view of trip details | US-6.02 |
| **SCR-040** | **POD Scan Upload** | Tracking Exec | Uploading digital POD | US-4.01 |
| **SCR-050** | **POD Verification Inbox** | Accounts Clerk | Verifying physical vs digital POD | US-4.02 |
| **SCR-060** | **Invoice Generation** | Accounts Clerk | Creating final bills | US-5.01 |
| **SCR-090** | **Master Data Manage** | Admin | Managing Tally-linked masters | US-1.01 |

---

## 3. SCREEN DESIGN SPECIFICATIONS

### SCREEN SCR-010: Dispatch Smart Grid

#### A. Screen Overview

* **User Role:** Dispatch Executive (Rahul)
* **Primary Purpose:** The central workspace for entering high volumes of Lorry Receipts (LRs) rapidly, mimicking Excel behavior.
* **Related Stories:** US-2.01 (High-Speed Entry), US-2.02 (Stationery Control)
* **Frequency of Use:** Continuous, hourly throughout the day.
* **Device Priority:** **Desktop Primary (PWA).** Not for mobile.
* **User Goals:**
1. Enter 50 LRs in under an hour without touching the mouse.
2. Ensure the physical LR number matches the system entry.
3. Quickly repeat data for the same client/route.


* **Business Goals:**
1. Eliminate redundant data entry between Dispatch and Accounts.
2. Maintain 100% audit trail of physical stationery.



#### B. Wireframe Description

**Layout Structure:**

* **Layout Type:** Full-screen Data Grid (AG Grid Enterprise style).
* **Header Area:** Minimalist. "Dispatch Register" title. Global search bar. "New Hire Memo" button. "Save All" indicator.
* **Primary Workspace:** A dense, multi-column grid occupying 95% of the screen real estate.

**Components & Elements:**

1. **The Smart Grid:**
* **Density:** Ultra-compact row height (e.g., 28px) to show maximum data.
* **Frozen Columns (Left):**
* `Status` (Icon: Draft, Hired, In-Transit)
* `LR Date` (Defaults to Today, editable to past Business Date - AS-01)
* `LR No.` (Pre-filled next available number from book, editable with validation - US-2.02)


* **Scrollable Columns (Middle - Core Data):**
* `Customer (Consignor)` (Type-ahead dropdown with Tally Master search)
* `Consignee` (Type-ahead dropdown)
* `Origin` (Dropdown or auto-fill based on customer contract)
* `Destination` (Dropdown)
* `Material Description` (Free text)
* `No. of Pkgs` (Numeric input)
* `Weight (MT)` (Numeric input, 3 decimal places)
* `Freight Rate` (Numeric, auto-populates if contract exists, else manual)
* `Freight Type` (Dropdown: Per MT, Fixed, Per Pkg)
* `Total Freight` (Calculated read-only column)
* `Payment Terms` (Dropdown: To Pay, Paid, TBB - defaults from Customer Master)


* **Action Column (Right, Pinned):**
* `Actions` (Kebab menu: Create Hire Memo, Mark Void, View Details)




2. **Keyboard Interaction Model:**
* **Enter Key:** Saves current cell, moves focus to the cell below.
* **Tab Key:** Saves current cell, moves focus to the cell to the right.
* **Arrow Keys:** Navigates focus without entering edit mode.
* **F2 / Double Click:** Enters edit mode for a cell.
* **Ctrl+D / Drag Handle:** Initiates "Fill-down" action for selected cells (US-2.01).


3. **Floating Footer / Status Bar:**
* Shows "Book No: MUM/2024 | Range: 1001-2000 | Next Available: 1045"
* Shows "Unsaved Changes: 0" (Auto-save indicator).



#### C. Interaction Flows

**Primary Flow (Daily Entry):**

1. Rahul opens the screen. The grid loads with today's entries. The last empty row at the bottom is pre-filled with today's date and the next LR number (e.g., 1045).
2. Focus starts on the `Customer` cell of the new row.
3. Rahul types "HAVE", hits Tab. System auto-selects "Havells India Ltd". Focus moves to `Consignee`.
4. Rahul types "ABC Dist", hits Tab. Auto-selects.
5. Rahul continues Tabbing through fields, entering numbers. `Total Freight` calculates instantly.
6. At the end of the row, Rahul hits Enter. The row saves (showing a brief green flash). The focus moves to the `Customer` cell of the *next* new row (LR 1046).

**Validation/Error Flow (Stationery Check - US-2.02):**

1. Rahul manually edits the pre-filled LR number from `1045` to `2005`.
2. Hits Tab to leave the cell.
3. **System Response:** Cell turns red with a tooltip: "Error: LR 2005 is outside your assigned book range (1001-2000)."
4. Value reverts to previous valid state or requires correction before saving.

**Voiding Flow (US-2.02):**

1. A physical LR page gets torn.
2. In the grid, Rahul right-clicks the row for that number.
3. Selects "Mark as Void".
4. A dialog appears: "Reason for Voiding?" (Required dropdown: Damaged, Printing Error, Other).
5. Rahul selects reason and confirms.
6. The row turns gray, all fields become read-only, and status changes to "Void". The number is consumed in the audit sequence.

#### D. Data & Business Rules

* **Data Display:**
* `Total Freight` = `Weight` * `Freight Rate` (if Per MT).
* Dates must be displayed in `DD-MM-YYYY` format.


* **Permissions:**
* Only `Dispatch` and `Admin` roles can access this screen.
* Only `Admin` can unlock/edit a row after it is linked to a Hire Memo.



---

### SCREEN SCR-020: Hire Memo Creation (Vehicle Hiring)

#### A. Screen Overview

* **User Role:** Dispatch Executive (Rahul)
* **Primary Purpose:** To link one or more LRs to a hired truck, define the financial agreement with the broker, calculate TDS and advance.
* **Related Stories:** US-3.01 (Hire Memo Calc), FR-1.2 (Multi-Drop), US-3.02 (Ad-hoc Charges)
* **Frequency of Use:** High, 20-30 times a day.
* **Device Priority:** Desktop Primary.
* **User Goals:**
1. Quickly select pending LRs to load onto a truck.
2. Select the correct Broker/Owner to ensure payment goes to the right account.
3. Accurately calculate the cash/bank advance and final balance.



#### B. Wireframe Description

**Layout Structure:**

* **Layout Type:** Master-Detail Form with an embedded list.
* **Header Area:** Title "New Hire Memo". Back button to Dispatch Grid.

**Components & Elements:**

1. **Section 1: Vehicle & Vendor Details (Top Panel - Form):**
* `Hire Memo Date` (Defaults to today).
* `Vehicle No.` (Type-ahead search from Vehicle Master. Shows type e.g., "32ft MXL").
* `Vendor (Broker/Owner)` (Type-ahead search from Tally Vendor Master).
* *Dynamic Display:* Once Vendor is selected, show small badge: "TDS Rate: 2%" or "Lower Deduction: 0.5% (Valid till Dec '26)".


2. **Section 2: Link LRs (Middle Panel - Embedded Grid):**
* **Title:** "Shipments to Load".
* **Button:** "+ Add LRs". Clicking opens a modal showing a list of all "Pending" LRs that are not yet hired. User selects checkboxes and confirms.
* **Selected LRs Grid:** Shows a read-only list of selected LRs: `LR No`, `Customer`, `Destination`, `Weight`, `Client Freight (Hidden for Tracking role)`.
* *Footer Summary:* "Total Loaded Weight: 15.5 MT" | "Total Client Revenue: ₹65,000".


3. **Section 3: Financial Calculation (Bottom Panel - The "Calculator"):**
* This section should look like a clear financial statement.
* **A. Vendor Freight:**
* `Hire Rate Basis` (Dropdown: Fixed, Per MT).
* `Hire Rate` (Input).
* `Total Lorry Hire (A)` (Calculated: e.g., ₹45,000).


* **B. Deductions:**
* `Less: TDS` (Calculated automatically based on Vendor Master rate % of A. E.g., 2% of 45k = ₹900). Read-only but overrideable with Admin password.
* `Other Deductions` (Input with reason).


* **C. Advance Payment:**
* `Advance Amount` (Input).
* `Payment Mode` (Dropdown: Cash (HO Petty Cash), Bank Transfer).
* `Reference/Slip No.` (Input, mandatory for Bank).


* **D. Final Totals (Prominent Display):**
* `Balance Payable at Destination (To Broker)` (Calculated: A - B - C).




4. **Action Bar:**
* **Primary:** "Finalize Hire Memo & Pay Advance" (Green).
* **Secondary:** "Save Draft".



#### C. Interaction Flows

**Primary Flow:**

1. Rahul arrives from the Dispatch Grid by selecting LRs and clicking "Create Hire Memo".
2. The screen loads with selected LRs already populated in Section 2.
3. Rahul selects Vehicle "HR55X1234" and Vendor "Sharma Trans".
4. System shows "TDS Rate: 2%".
5. Rahul enters a Fixed Hire Rate of ₹45,000.
6. System calculates `Total Lorry Hire: ₹45,000` and `TDS: ₹900`.
7. Rahul enters Advance: ₹10,000, Mode: Cash.
8. System calculates `Balance Payable: ₹34,100`.
9. Rahul clicks "Finalize".
10. **System Validation:** Checks if Petty Cash balance is sufficient (if Cash mode).
11. **Success:** Hire Memo is saved. LRs status changes to "In-Transit". Petty Cash is deducted. A printable Hire Memo PDF is generated.

---

### SCREEN SCR-050: POD Verification Inbox

#### A. Screen Overview

* **User Role:** Accounts Clerk (Suresh)
* **Primary Purpose:** A worklist for the Finance team to verify that the physical paper POD has arrived and matches the digital scan uploaded by Operations, acting as the final gateway before billing.
* **Related Stories:** US-4.02 (Verify Physical POD), FR-2.2 (Billing Block)
* **Frequency of Use:** Daily. The primary screen for Accounts staff.
* **Device Priority:** Desktop Only.
* **User Goals:**
1. Clear the backlog of pending PODs efficiently.
2. Reject blurry or incorrect scans back to Operations.
3. Mark physical copies as received to unlock billing.



#### B. Wireframe Description

**Layout Structure:**

* **Layout Type:** Split-Screen / Master-Detail view.
* **Left Panel (The List - 40% width):** A filterable list of pending trips.
* **Right Panel (The Workspace - 60% width):** Details of the selected trip and the POD verification interface.

**Components & Elements:**

1. **Left Panel: Pending Verification List:**
* **Filters:** Date Range, Customer, Status (Scan Uploaded, Rejected).
* **The List Cards:** Each item is a summary card:
* `LR No. / Hire Memo No.`
* `Customer Name`
* `Delivery Date`
* `Status Badge` (e.g., "Scan Pending Review" - Yellow)


* List is sorted by Delivery Date (oldest first).


2. **Right Panel: Verification Workspace (When a list item is clicked):**
* **Header:** Trip Summary (`LR 1001 | Havells | Delhi -> Mumbai`).
* **Top Half: The Digital Scan Viewer:**
* Large image viewer displaying the uploaded POD scan.
* Controls: Zoom In/Out, Rotate, Download, "Open in new window" (for dual monitor setups).


* **Bottom Half: The Action Checklist:**
* **Title:** "Verification & Ticking".
* **Question 1:** "Is the digital scan clear and legible?"
* Buttons: `Yes (Pass)` | `No (Reject back to Ops)`
* *Interaction:* Clicking "No" opens a text box for "Rejection Reason" and a "Send Back" button.


* **Question 2:** "Has the **ORIGINAL PHYSICAL PAPER** copy been received via courier?"
* *Visual Context:* This is the most critical action.
* Checkbox: `[ ] Yes, Physical Copy Received & Verified` (Large, prominent checkbox).
* *Helper Text:* "Ticking this will unlock invoice generation for this LR."






3. **Action Bar (Bottom Right):**
* The actions depend on the state of the checklist.
* Initially disabled: "Confirm & Unlock Billing" (Gray).
* Once Checkbox 2 is ticked: "Confirm & Unlock Billing" becomes active (Green).



#### C. Interaction Flows

**Primary Flow (Happy Path):**

1. Suresh receives a courier packet with 10 PODs. He opens the screen.
2. He picks up the physical POD for LR 1001. He clicks LR 1001 in the left list.
3. The digital scan loads on the right.
4. Suresh visually compares the paper in his hand with the image on screen. They match and are clear.
5. He clicks "Yes (Pass)" for scan clarity.
6. He physically ticks the paper POD with a pen and then clicks the large `[X] Yes, Physical Copy Received` checkbox on the screen.
7. The "Confirm & Unlock Billing" button turns green. He clicks it.
8. **Success:** The item disappears from the pending list. The LR status changes to "Ready for Billing". A toast notification confirms.

---

## 4. DESIGN SYSTEM GUIDELINES

### Typography (System Fonts for Speed)

* **Font Family:** Inter, Roboto, or system UI fonts (San Francisco/Segoe UI). Avoid custom web fonts that slow loading.
* **H1 (Page Titles):** 24px, Semi-Bold.
* **H2 (Section Headers):** 18px, Medium.
* **Body Text:** 14px, Regular.
* **Data Grid Text:** 13px or 12px (for maximum density), Monospaced for numbers.

### Color Palette (Enterprise Utility)

* **Primary Action:** #0066CC (Strong Blue) - used for primary buttons, active states.
* **Backgrounds:**
* App Background: #F4F7F9 (Light Gray-Blue)
* Content Cards/Grids: #FFFFFF (White)


* **Status Colors:**
* **Success / Paid / Delivered:** #008844 (Green)
* **Pending / In-Transit:** #FF9900 (Amber/Orange)
* **Error / Void / Rejected:** #D32F2F (Red)


* **Text:**
* Primary: #172B4D (Dark Blue-Gray)
* Secondary/Labels: #5E6C84 (Medium Gray)



### Component Library Notes

**1. The Data Grid (AG Grid):**

* Must support custom cell rendering for status chips.
* Row height must be configurable by user (Compact/Standard).
* Edit mode shows a distinct border highlight (e.g., blue outline).
* Dirty cells (edited but unsaved) show a small corner triangle indicator.

**2. Buttons:**

* **Primary:** Solid blue background, white text. Upper-case for main actions (e.g., "FINALIZE HIRE MEMO").
* **Secondary:** White background, blue border, blue text (e.g., "Save Draft").
* **Destructive:** Light red background, dark red text (e.g., "Reject POD").

**3. Form Fields:**

* Type-ahead dropdowns (Comboboxes) are critical for Masters. They must support searching by name or code.
* Financial inputs must automatically format with commas (₹1,45,000) and align right.

---

## 6. PROTOTYPING NOTES (High-Interaction Areas)

### **The Dispatch Grid (SCR-010)**

* **Performance is paramount.** The prototype must demonstrate near-instant cell navigation. Lag between hitting 'Tab' and the next cell focusing is unacceptable.
* **Keyboard Traps:** Ensure the focus stays within the grid while editing and doesn't jump to the browser address bar.
* **Fill-Down:** Prototype the drag-handle interaction clearly. Show a visual ghost of the data being copied before the user releases the mouse.

### **POD Verification (SCR-050)**

* **Image Viewer:** The zoom/pan experience must be smooth. Users will need to zoom in to read faint stamps or signatures on the scanned paper.
* **The Checkbox:** The "Physical Copy Received" checkbox should provide satisfying feedback. Perhaps a slight animation or a distinct checkmark sound, emphasizing the importance of this step.


# UI/UX Design Specifications
## Project: CTC Logistics Management System (LMS)

**Version:** 1.2  
**Date:** January 26, 2026

### 1. Information Architecture

**Screen Inventory:**
| Screen ID | Screen Name | Primary User Role | Core Function |
| :--- | :--- | :--- | :--- |
| SCR-010 | Dispatch Smart Grid | Dispatch Exec | High-speed LR entry |
| **SCR-015** | **Lorry Receipt Detail View** | **All Roles (Read-Only)** | **View legal document details** |
| SCR-020 | Hire Memo Creation | Dispatch Exec | Hiring & Advances |
| SCR-035 | Mobile Trip Card View | Tracking Exec (Field) | Mobile tracking view |
| SCR-050 | POD Verification Inbox | Accounts Clerk | Verifying physical POD |
| SCR-080 | HO Petty Cash Ledger | Accounts Clerk | Managing cash balance |
| SCR-090 | Master Data Manage | Admin | Tally-linked masters |

### 2. Screen Design Specifications

#### SCREEN SCR-010: Dispatch Smart Grid
* **Primary Purpose:** High-volume, keyboard-driven data entry mimicking Excel.
* **Key Interactions:**
    * Tab/Enter for navigation.
    * Frozen Left Columns: Status, Date, LR No.
    * Keyboard shortcut (e.g., Context Menu key) to access row actions like "Mark Void".

#### SCREEN SCR-015: Lorry Receipt (LR) Detail View (NEW)
* **Primary Purpose:** A read-only, digital representation of the finalized legal Lorry Receipt.
* **Access:** Opened by clicking an LR number link from grids or cards.
* **Layout Structure:** A structured form mirroring the physical PDF.
    * **Header:** Company branding, LR No, Date.
    * **Vehicle & Route:** Truck No, Type, Origin, Destination.
    * **Parties:** Side-by-side blocks for Consignor and Consignee details (Name, Address, GSTIN).
    * **Goods Grid:** Table with Pkgs, Packing Type, Description, Weight, Freight Basis.
    * **Financials & Tax:** Freight Rate (hidden for unauthorized roles) and GST Liability checkboxes showing RCM status.
    * **Footer:** Terms & Conditions text and signatory placeholder.

#### SCREEN SCR-020: Hire Memo Creation
* **Primary Purpose:** Linking LRs to a truck and calculating vendor financials.
* **Key Interactions:** Select Vendor, enter Hire Rate, enter Advance Amount. System calculates TDS and final Balance Payable automatically.

#### SCREEN SCR-035: Mobile Trip Card View
* **Primary Purpose:** Read-only mobile view for field staff.
* **Layout:** Vertical stack of cards.
* **Card Content:** LR No, Status Badge, Route, Customer, Truck, Latest Remark.

#### SCREEN SCR-050: POD Verification Inbox
* **Primary Purpose:** Accounts workflow to verify physical versus digital PODs.
* **Key Interaction:** Split-screen view (List + Document). Crucial "Physical Copy Received" checkbox that unlocks the "Generate Invoice" action.

#### SCREEN SCR-080: HO Petty Cash Ledger
* **Primary Purpose:** Managing physical cash balance at HO.
* **Layout:** Prominent "Current Cash on Hand" display. Button to record deposits. Chronological ledger grid showing deposits (green) and advance deductions (red) with a running balance column.

#### SCREEN SCR-090: Master Data Manage
* **Key Visual:** Tally-synced records show a Padlock icon next to the disabled Name field with a tooltip explaining the lock.