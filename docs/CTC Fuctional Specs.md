## BACKLOG: CTC LOGISTICS MANAGEMENT SYSTEM

### EPIC 1: Master Data Management

* **Description:** Establish the foundational data entities required for logistics operations, ensuring naming consistency with Tally to facilitate seamless financial integration.
* **BRD Links:** FR-3.3, AS-05

#### User Stories:

**Story ID:** US-1.01
**Title:** Manage Tally-Synced Customer and Vendor Masters

**User Story:**
As an Admin,
I want to create and manage records for Customers and Vendors,
so that I have a consistent data source for LRs and Hire Memos that matches our accounting system.

**Acceptance Criteria:**

* **AC1:** Given I am on the Master Data screen, when I create a new Customer or Vendor, then the system must require a unique name, GSTIN (if applicable), and contact details.
* **AC2:** Given a record has been successfully exported to Tally, when a user tries to edit the "Name" field, then the system must lock the field to prevent spelling changes.
* **AC3:** Given I have a lower TDS deduction certificate for a vendor, when I upload it to the Vendor Master, then the system must allow a manual override of the default 2% TDS rate.

**Source Requirements:**

* Linked to: FR-3.3, AS-02

**Technical Notes:**

* [DB] Create `Customers`, `Vendors`, and `Documents` tables.
* [BE] Implement a "Locked" flag in the schema for Tally-synchronized records.

---

### EPIC 2: Dispatch & Operations (The Smart Grid)

* **Description:** Digitizing the core shipment entry process using high-speed data entry methods that mimic the efficiency of Excel while enforcing stationery controls.
* **BRD Links:** FR-1.1, FR-1.2, FR-1.3, AS-04

#### User Stories:

**Story ID:** US-2.01
**Title:** High-Speed LR Entry via Smart Grid

**User Story:**
As a Dispatcher,
I want to enter shipment details into a responsive, keyboard-navigable grid,
so that I can process high volumes of Lorry Receipts as quickly as I did in Excel.

**Acceptance Criteria:**

* **AC1:** Given the Dispatch Grid is open, when I use the Tab or Arrow keys, then the focus must move between cells without using a mouse.
* **AC2:** Given I am entering data for a long list of shipments, when I scroll horizontally, then the LR Number and Truck Number columns must remain frozen on the left.
* **AC3:** Given I am entering repetitive data for the same route, when I use a "Fill-down" shortcut, then the system must copy the value to the selected cells below.

**Source Requirements:**

* Linked to: FR-1.1

**Technical Notes:**

* [FE] Implementation of **AG-Grid (Community)** is required for performance and keyboard navigation.
* [BE] Batch save API endpoint required to handle multiple row updates in one transaction.

**Story ID:** US-2.02
**Title:** Enforce LR Stationery Inventory Controls

**User Story:**
As a Dispatcher,
I want the system to validate the LR number I enter against my assigned book,
so that we maintain numerical integrity and prevent duplicate entries.

**Acceptance Criteria:**

* **AC1:** Given I am entering a new LR, when I input a number outside my assigned range (e.g., 1001-2000), then the system must prevent saving and show an error.
* **AC2:** Given a physical LR page is damaged, when I mark the number as "Void" in the grid, then the system must exclude it from financial calculations but keep it in the audit sequence.

**Source Requirements:**

* Linked to: FR-1.2, FR-1.3, AS-04

#### Suggested Tasks for Complex Stories (US-2.01)

* [ ] [DB] Design `LorryReceipts` table with indexing on LR Number (estimate: 4 hours)
* [ ] [BE] Build REST API for CRUD operations on LR records (estimate: 8 hours)
* [ ] [FE] Configure AG-Grid with custom cell editors and frozen columns (estimate: 12 hours)
* [ ] [UX] Design the "Fill-down" and keyboard shortcut overlay (estimate: 4 hours)

---

### EPIC 3: Vendor Hiring & Financials

* **Description:** Managing the contractual and financial relationship with third-client truck owners and brokers, including freight calculations and statutory deductions.
* **BRD Links:** FR-2.1, FR-3.1, FR-3.2

#### User Stories:

**Story ID:** US-3.01
**Title:** Calculate Hire Memo with Automated TDS

**User Story:**
As a Dispatcher,
I want the system to automatically calculate the balance payable to a broker,
so that I can ensure accurate payments that include statutory tax deductions.

**Acceptance Criteria:**

* **AC1:** Given a new Hire Memo is being created, when I enter the Total Freight and Advance, then the system must automatically subtract 2% TDS (or vendor-specific rate) to show the final Balance.
* **AC2:** Given the Hire Memo is finalized, when an advance is paid, then the system must update the Petty Cash balance for the Head Office.

**Source Requirements:**

* Linked to: FR-2.1, AS-03

**Technical Notes:**

* [BE] Calculation logic must reside on the server to prevent UI tampering with financial totals.
* [INT] Integration with a "Petty Cash" ledger table is required.

**Story ID:** US-3.02
**Title:** Record Supplementary Trip Charges

**User Story:**
As a Dispatcher,
I want to add detention or toll charges to a finalized trip,
so that we can recover unexpected costs from the client or pay the driver correctly.

**Acceptance Criteria:**

* **AC1:** Given a trip is marked as "Finalized," when I add a "Detention" charge, then the system must flag the record for Admin Approval.
* **AC2:** Given an Admin approves an ad-hoc charge, when the invoice is generated, then the charge must appear as a separate line item.

**Source Requirements:**

* Linked to: FR-3.1

---

### EPIC 4: POD Lifecycle & Verification

* **Description:** Ensuring revenue protection by enforcing a strict workflow for Proof of Delivery (POD) documents.
* **BRD Links:** FR-2.2

#### User Stories:

**Story ID:** US-4.01
**Title:** Upload and Manage Digital POD Scans

**User Story:**
As a Tracking Executive,
I want to upload a scan or photo of the signed POD,
so that the Accounts team has an immediate digital proof of delivery for review.

**Acceptance Criteria:**

* **AC1:** Given I am on the tracking screen, when I upload an image, then the system must tag the LR status as "Digital Scan Uploaded."
* **AC2:** Given I am logged in as a Tracking Executive, when I view the trip details, then the freight rates and financial values must be hidden from my view.

**Source Requirements:**

* Linked to: FR-2.2, Stakeholder Roles

**Technical Notes:**

* [SEC] Implement Field Level Security (FLS) to hide financial columns from the "Tracking" role.
* [STG] Use AWS S3 or Azure Blob storage for document scans.

**Story ID:** US-4.02
**Title:** Verify Physical POD for Billing Unlock

**User Story:**
As an Accountant,
I want to confirm the receipt of the physical paper POD,
so that the system can unlock the ability to generate the final invoice.

**Acceptance Criteria:**

* **AC1:** Given an LR has a digital scan, when I receive the physical paper and check the "Physical Copy Received" box, then the "Generate Invoice" button must become active.
* **AC2:** Given a scan is blurry or incorrect, when I mark the POD as "Rejected," then the system must notify the Tracking team to re-upload.

**Source Requirements:**

* Linked to: FR-2.2

---

### EPIC 5: Billing & Accounts Reconciliation

* **Description:** Managing client revenue, specialized invoice formats, and the reconciliation of short payments.
* **BRD Links:** FR-2.2, FR-2.3

#### User Stories:

**Story ID:** US-5.01
**Title:** Generate Standard and Annexure Invoices

**User Story:**
As an Accountant,
I want to generate professional invoices and detailed shipment annexures,
so that our corporate clients receive accurate billing documents for processing.

**Acceptance Criteria:**

* **AC1:** Given a verified POD, when I click "Generate Invoice," then the system must produce a PDF using the CTC Standard template (No GST added, per RCM).
* **AC2:** Given a client requires a consolidated bill, when I select multiple LRs, then the system must generate a single Summary Invoice with a detailed Annexure of all shipments.

**Technical Notes:**

* [BE] Integration with a PDF generation library (e.g., QuestPDF or iTextSharp).

---

### EPIC 6: Platform & Compliance

* **Description:** Ensuring system integrity, mobile accessibility, and accounting sync.
* **BRD Links:** AS-01, NFR-7.1, NFR-7.3

#### User Stories:

**Story ID:** US-6.01
**Title:** Audit Log for Financial Changes

**User Story:**
As an Admin,
I want a log of all changes made to finalized records,
so that I can audit any backdated entries or rate adjustments for potential fraud.

**Acceptance Criteria:**

* **AC1:** Given a finalized LR is edited, when the user saves changes, then the system must record the `Old Value`, `New Value`, `User ID`, and `Timestamp`.

**Story ID:** US-6.02
**Title:** Responsive Mobile Card View

**User Story:**
As a Field Operator,
I want to view trip details as vertical cards on my phone,
so that I can update location remarks without navigating a wide horizontal grid.

**Acceptance Criteria:**

* **AC1:** Given the system is accessed on a screen width < 768px, when the Dispatch/Tracking page loads, then the grid must transform into a vertical list of cards.

**Technical Notes:**

* [FE] Use CSS Media Queries or AG-Grid's auto-responsive features.

---

### PRIORITIZATION SUMMARY (MoSCoW)

* **Must Have:** US-1.01 (Masters), US-2.01 (Grid), US-3.01 (Hire Memo), US-4.02 (POD Verification), US-5.01 (Invoicing), US-6.01 (Audit).
* **Should Have:** US-2.02 (Stationery), US-3.02 (Ad-hoc Charges), US-6.02 (Mobile View).
* **Could Have:** US-3.03 (Return Trip Linking - *implied in BRD 5.4 but lower priority*).
* **Won't Have:** Automated WhatsApp (Phase 2), Driver App (Out of Scope).


# Functional Specifications (Agile Backlog)
## Project: CTC Logistics Management System (LMS)

**Version:** 1.2  
**Date:** January 26, 2026

### EPIC 1: Master Data Management

**Story ID:** US-1.01
**Title:** Manage Tally-Synced Customer and Vendor Masters
**User Story:** As an Admin, I want to manage Customer and Vendor records so that I have a consistent data source that matches Tally.
**Acceptance Criteria:**
* **AC1:** Create records with unique names and GSTIN details.
* **AC2:** If a record is synced with Tally, displays a visible "Padlock" icon and disables editing of the Name field.
* **AC3:** Allow upload of lower-deduction TDS certificates to override the default 2% rate for vendors.

---

### EPIC 2: Dispatch & Operations

**Story ID:** US-2.01
**Title:** High-Speed LR Entry via Smart Grid
**User Story:** As a Dispatcher, I want to enter shipments into a responsive, keyboard-navigable grid to process high volumes quickly.
**Acceptance Criteria:**
* **AC1:** Tab/Arrow keys move focus between cells for inline editing.
* **AC2:** LR Number and Truck Number columns remain frozen while scrolling.
* **AC3:** Supports "Fill-down" for repetitive data.
**Technical Notes:** Implement keyboard shortcuts for row actions (e.g., context menu key for "Mark Void") to avoid mouse dependency.

**Story ID:** US-2.02
**Title:** Enforce LR Stationery Inventory Controls
**User Story:** As a Dispatcher, I want the system to validate the LR number I enter against my assigned book to prevent duplicates.
**Acceptance Criteria:**
* **AC1:** Prevents saving if the entered number is outside the user's assigned range.
* **AC2:** Allows marking damaged pages as "Void" to exclude them from finance but keep them in the audit sequence.

**Story ID:** US-2.03 (NEW)
**Title:** View Digital Lorry Receipt (LR)
**User Story:** As an authorized user, I want to view a read-only digital version of the finalized LR that looks like the physical document.
**Acceptance Criteria:**
* **AC1:** Clicking an LR number opens a read-only detail view.
* **AC2:** The view displays all fields from the physical LR: Header (No, Date), Vehicle, Consignor/Consignee details, Goods Grid, and GST Liability checkboxes.
* **AC3:** Financial rates are hidden for users without permission (e.g., Tracking Executive).

---

### EPIC 3: Vendor Hiring & Financials

**Story ID:** US-3.01
**Title:** Calculate Hire Memo with Automated TDS
**User Story:** As a Dispatcher, I want the system to automatically calculate the balance payable to a broker, including TDS and advances.
**Acceptance Criteria:**
* **AC1:** Automatically subtracts 2% TDS (or vendor-specific rate) from Total Freight.
* **AC2:** Subtracts Advance amount to show final Balance Payable.

**Story ID:** US-3.03
**Title:** Manage Head Office Petty Cash Ledger
**User Story:** As an Accountant, I want to record deposits and view a running balance of the HO Petty Cash to reconcile daily funds.
**Acceptance Criteria:**
* **AC1:** View ledger with Date, Description, Money In, Money Out, and Running Balance.
* **AC2:** Manually record "Bank Deposit" transactions.
* **AC3:** System automatically inserts a "Withdrawal" record when a cash advance is finalized on a Hire Memo.

---

### EPIC 4: POD Lifecycle & Verification

**Story ID:** US-4.01
**Title:** Upload Digital POD Scans
**User Story:** As a Tracking Executive, I want to upload a scan of the signed POD for immediate digital proof.
**Acceptance Criteria:**
* **AC1:** Upload image file; system tags LR status as "Digital Scan Uploaded".

**Story ID:** US-4.02
**Title:** Verify Physical POD for Billing Unlock
**User Story:** As an Accountant, I want to confirm receipt of the physical paper POD to unlock invoice generation.
**Acceptance Criteria:**
* **AC1:** Mark "Physical Copy Received" only after verifying the paper document.
* **AC2:** Ticking the checkbox enables the "Generate Invoice" button.
* **AC3:** Upon success, provides a direct link to generate the invoice for that trip.

---

### EPIC 5: Billing & Accounts Reconciliation

**Story ID:** US-5.01
**Title:** Generate Standard and Annexure Invoices
**User Story:** As an Accountant, I want to generate accurate PDF invoices for corporate clients.
**Acceptance Criteria:**
* **AC1:** Generates PDF using the standard CTC template (RCM implied).
* **AC2:** Supports generating a consolidated Summary Invoice with an Annexure for multiple LRs.

---

### EPIC 6: Platform & Mobile

**Story ID:** US-6.02
**Title:** Responsive Mobile Card View for Field Staff
**User Story:** As a Field Operator, I want to view trip details as vertical cards on my phone for quick status checks.
**Acceptance Criteria:**
* **AC1:** On mobile devices, the grid is replaced by a list of cards.
* **AC2:** Cards show critical info only: LR No, Customer, Truck, Status, Latest Remark.