# Business Requirements Document (BRD)
## Project: CTC Logistics Management System (LMS) Digitalization

**Version:** 1.2  
**Status:** Finalized Single Source of Truth  
**Project Lead Analyst:** Senior Functional BA  
**Date:** January 25, 2026  

---

### 1. Project Overview
* **Project Name:** CTC Logistics Management System (LMS)
* **Business Sponsor:** Abhishek
* **Objective Statement:** To digitize the manual, paper-based workflows of Chandra Transport Corporation (CTC), replacing traditional registers (Day Book, Dispatch, Hire Memo, Bill Notebook) with a centralized ERP. The system will ensure financial integrity via Tally integration and enforce operational discipline through mandatory POD (Proof of Delivery) reconciliation.
* **Business Case Summary:**
    * **Data Accuracy:** Single-entry point reduces errors across logistics and accounting.
    * **Revenue Protection:** Prevents billing leaks by tracking the physical POD lifecycle.
    * **Regulatory Compliance:** Automated handling of Indian TDS (Section 194C) and GST RCM.
    * **Efficiency:** High-speed data entry mimicking Excel for legacy user adoption.

---

### 2. Project Scope
* **In-Scope:**
    * **Masters:** Customer, Vendor (Broker/Owner), Vehicle, and Route Master Data Management.
    * **Operations:** Digital LR creation, Excel-like Dispatch Grid, and Trip Tracking.
    * **Finance:** Hire Memos with TDS/Advance calculations and Billing (Invoice/Annexure).
    * **Compliance:** Tally XML/Excel export, Stationery Inventory, and Audit Logging.
* **Out-of-Scope (Phase 1):**
    * Direct Bank/UPI API integration.
    * Automated Driver WhatsApp/SMS alerts.
    * Branch-level direct entry (Centralized Head Office entry only).

---

### 3. Assumptions and Constraints
* **AS-01: Two-Date Architecture:** The system will implement an editable **Business Date** (for accounting accuracy) and a read-only **System Entry Timestamp** (for audit accountability) to resolve backdating conflicts.
* **AS-02: Taxation Policy:** It is assumed that all corporate freight follows the **Reverse Charge Mechanism (RCM)**. TDS on vendor payments is assumed at a standard **2%** unless a specific lower-deduction certificate is uploaded to the Vendor Master.
* **AS-03: Petty Cash Management:** Advances paid to drivers at the Head Office are assumed to be managed via an internal **Petty Cash Module** within the LMS.
* **AS-04: Stationery Audit:** The system must account for every pre-printed LR number. Numbers that are damaged or unused must be recorded as **"Void"** to ensure no gaps in numerical reporting.
* **AS-05: Tally Sync:** It is assumed that once a Customer or Vendor is synced to Tally, their **Name field** in the ERP is locked to prevent sync errors.

---

### 4. Stakeholders and User Roles

| Role (Actor) | Department | Key Responsibilities | Interaction with System |
| :--- | :--- | :--- | :--- |
| **Admin** | Management | Approvals & Configuration | Full access; manages user roles and overrides locked records (e.g., backdating more than 48hrs). |
| **Dispatch** | Operations | Shipments & Hiring | High-speed entry of LRs and Hire Memos using the Smart Grid. |
| **Tracking** | Operations | Monitoring & PODs | Updates daily trip remarks and uploads digital POD scans. **Restricted from viewing freight rates.** |
| **Accounts** | Finance | Billing & Compliance | Verifies physical PODs, generates invoices, and manages Tally exports. |

---

### 5. Functional Requirements

#### 5.1 Dispatch & Operations Management
> **FR-1.1: High-Speed Dispatch Grid**
> * **User Story:** As a Dispatcher, I want to use an Excel-like grid to enter shipment data so that I can maintain the speed of manual entry.
> * **Acceptance Criteria:**
>     * AC1: Support for Tab/Arrow key navigation and inline cell editing.
>     * AC2: Frozen columns for LR Number and Truck Number.
>     * AC3: Support for "Fill-down" functionality for repetitive data (e.g., same customer/route).

> **FR-1.2: Stationery Inventory Control**
> * **User Story:** As an Admin, I want to assign ranges of pre-printed LR numbers to dispatchers so that I can prevent numerical duplicates.
> * **Acceptance Criteria:**
>     * AC1: Master record for LR Books (Prefix + Start/End Serial).
>     * AC2: Validation to prevent users from using numbers outside their assigned range.
>     * AC3: A "Void" workflow to mark damaged physical pages as unusable in the system.

#### 5.2 Financials, Taxation & Billing
> **FR-2.1: Automated Hire Memo Logic**
> * **User Story:** As a Dispatcher, I want the system to calculate the driver balance after TDS and advances so that I don't make manual errors.
> * **Acceptance Criteria:**
>     * AC1: Calculation: `(Total Freight - TDS) - Advance = Balance Payable`.
>     * AC2: TDS deducted must be tracked as a liability in the Tally export.

> **FR-2.2: The Billing Block (Physical POD Verification)**
> * **User Story:** As an Accountant, I want the system to prevent invoice generation until I have the physical POD so that I avoid client payment rejections.
> * **Acceptance Criteria:**
>     * AC1: Invoice button is disabled until the "Physical POD Received" checkbox is ticked.
>     * AC2: A "Verification Worklist" dashboard for Accounts to see uploaded scans awaiting physical arrival.

#### 5.3 Operational Exceptions
> **FR-3.1: Supplementary Costing (Detention/Tolls)**
> * **User Story:** As a Dispatcher, I want to add waiting charges or tolls to an existing trip so that I can recover these costs.
> * **Acceptance Criteria:**
>     * AC1: Ability to add ad-hoc charges to finalized Hire Memos or Invoices.
>     * AC2: All ad-hoc charges above a defined threshold require Admin approval.

> **FR-3.2: Forward/Return Trip Linking**
> * **User Story:** As a Manager, I want to link a return load to its original truck hire so that I can see the total profitability of that vehicle's trip.
> * **Acceptance Criteria:**
>     * AC1: Link "Return LR" to an existing "Forward Trip" Hire Memo.
>     * AC2: Profit Report: `(Forward Revenue + Return Revenue) - (Total Truck Hire Cost)`.

---

### 6. High-Level Process Flows

#### 6.1 The End-to-End Shipment Lifecycle

```mermaid
graph TD
    A[Physical LR Issued] --> B[Digital entry in Smart Grid]
    B --> C[Hire Memo: TDS/Advance Paid]
    C --> D[Tracking: Daily Location Updates]
    D --> E[Delivery: Scan POD Uploaded]
    E --> F{Physical POD in Hand?}
    F -- No --> G[Wait for Courier]
    F -- Yes --> H[Accounts Verifies & Unlocks]
    H --> I[Generate Invoice & Annexure]
    I --> J[Tally Sync & Payment Tracking]
    7. Architectural & Non-Functional Guidelines
Architecture: .NET 8 Backend (for secure Windows/Tally integration) and React Frontend (for the high-speed AG Grid experience).

Delivery Mode: Progressive Web App (PWA) to provide a desktop "app-like" experience for HO staff.

Mobile UI Strategy: The system must implement a Card View on mobile devices, automatically hiding the complex desktop grid and showing vertical "Shipment Cards" for field tracking.

Audit Trail: Every financial override (e.g., changing a rate after finalizing) requires a "Reason for Change" and logs the User ID and Timestamp.

Data Retention: Active data access for 8 years per Indian Tax law. Documents older than 2 years moved to cold storage.

8. Glossary of Terms
LR (Lorry Receipt): The master legal document for a shipment.

Hire Memo: The hiring contract between CTC and the vehicle owner/broker.

POD (Proof of Delivery): The signed LR copy confirming delivery.

RCM: Reverse Charge Mechanism (GST rule where the client pays tax).

TDS: Tax Deducted at Source (Income tax deduction under Section 194C).


# Business Requirements Document (BRD)
## Project: CTC Logistics Management System (LMS) Digitalization

**Version:** 1.4  
**Date:** January 26, 2026  
**Status:** Finalized for Client Review

---

### 1. Project Overview
* **Project Name:** CTC Logistics Management System (LMS) Digitalization
* **Objective Statement:** To digitize the manual, paper-based workflows of Chandra Transport Corporation (CTC), replacing traditional registers with a centralized ERP. The system will ensure financial integrity via Tally integration and enforce operational discipline through mandatory Proof of Delivery (POD) reconciliation.
* **Business Case Summary:**
    * **Data Accuracy:** Single-entry point reduces errors across logistics and accounting.
    * **Revenue Protection:** Prevents billing leaks by tracking the physical POD lifecycle.
    * **Regulatory Compliance:** Automated handling of Indian TDS (Section 194C) and GST RCM.
    * **Efficiency:** High-speed data entry mimicking Excel for legacy user adoption.
    * **Legal Integrity:** Digital representation of Lorry Receipts that mirrors the physical legal document.

### 2. Project Scope
* **In-Scope:**
    * **Masters:** Customer, Vendor, Vehicle, and Route Master Data Management (Tally-synced).
    * **Operations:** Digital LR creation, Excel-like Dispatch Grid, Trip Tracking, and **read-only digital LR viewing**.
    * **Finance:** Hire Memos with TDS/Advance calculations, HO Petty Cash Management, and Billing.
    * **Compliance:** Tally export, Stationery Inventory control, POD lifecycle, and Audit Logging.
* **Out-of-Scope (Phase 1):**
    * Direct Bank/UPI API integration.
    * Automated Driver WhatsApp/SMS alerts.
    * Branch-level direct data entry.

### 3. Assumptions and Constraints
* **AS-01: Two-Date Architecture:** The system will implement an editable **Business Date** for accounting and a read-only **System Entry Timestamp** for audit accountability.
* **AS-02: Taxation Policy:** Corporate freight follows the **Reverse Charge Mechanism (RCM)**. Vendor TDS is **2%** unless a lower-deduction certificate is provided.
* **AS-03: Petty Cash Management:** Head Office driver advances are managed via an internal **Petty Cash Module** tracking cash inflows and outflows.
* **AS-04: Stationery Audit:** Every pre-printed LR number must be accounted for. Damaged numbers must be marked as **"Void"** to ensure no audit gaps.

### 4. Stakeholders and User Roles

| Role | Department | Key Responsibilities | Interaction with System |
| :--- | :--- | :--- | :--- |
| **Admin** | Management | Approvals & Configuration | Full access; manages user roles and overrides. |
| **Dispatch** | Operations | Shipments & Hiring | High-speed entry of LRs and Hire Memos. |
| **Tracking** | Operations | Monitoring & PODs | Updates remarks and uploads scans. **Financials hidden.** |
| **Accounts** | Finance | Billing & Compliance | Verifies physical PODs, manages Petty Cash, generates invoices. |

### 5. Functional Requirements

#### 5.1 Dispatch & Operations Management
> **FR-1.1: High-Speed Dispatch Grid**
> * **User Story:** As a Dispatcher, I want to use an Excel-like grid for shipment data entry to maintain manual speed.
> * **Acceptance Criteria:** Support for Tab/Arrow navigation, inline editing, frozen columns, and keyboard shortcuts for row actions (e.g., Void).

> **FR-1.2: Stationery Inventory Control**
> * **User Story:** As an Admin, I want to assign LR number ranges to prevent duplicates and audit usage.
> * **Acceptance Criteria:** Validation against assigned book ranges; workflow to mark damaged pages as "Void".

> **FR-1.3: Digital Lorry Receipt (LR) View (NEW)**
> * **User Story:** As a user (Dispatch/Tracking/Accounts), I want to view a digital representation of the finalized Lorry Receipt that matches the physical paper document structure.
> * **Acceptance Criteria:** Read-only view displaying all legal fields: Consignor/Consignee details, Goods description, Weight, Truck No, and GST liability status, formatted like the physical PDF.

#### 5.2 Financials, Taxation & Billing
> **FR-2.1: Automated Hire Memo Logic**
> * **User Story:** As a Dispatcher, I want the system to calculate driver balance after TDS and advances to prevent errors.
> * **Acceptance Criteria:** Formula: `(Total Freight - TDS) - Advance = Balance`. TDS is tracked for Tally.

> **FR-2.2: The Billing Block (Physical POD Verification)**
> * **User Story:** As an Accountant, I want to prevent invoice generation until the physical POD is received to avoid payment rejections.
> * **Acceptance Criteria:** Invoice generation is disabled until the "Physical Copy Received" checkbox is ticked by Accounts.

> **FR-2.3: Head Office Petty Cash Ledger**
> * **User Story:** As an Accountant, I want a digital ledger for HO Petty Cash to reconcile daily cash and ensure funds for advances.
> * **Acceptance Criteria:** Record bank deposits (money in) and automatically record cash advances from Hire Memos (money out) to show a running balance.

---

### 6. Architectural & Non-Functional Guidelines
* **Architecture:** **.NET 8** Backend (for Tally integration) and **React** Frontend (for high-performance grid).
* **Delivery Mode:** **Progressive Web App (PWA)** for a desktop app-like experience at HO.
* **Mobile UI Strategy:** **Responsive Card View** for field staff on mobile devices, replacing the dense grid.
* **Audit Trail:** Logs `Old Value`, `New Value`, `User ID`, and `Timestamp` for all financial changes.
* **Data Retention:** Active data for **8 years** per Indian Tax law.