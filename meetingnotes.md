Detailed Meeting Minutes: CT-ERP Requirement Synthesis
Date: December 23, 2025

Location: CTC Office / Virtual

Subject: Transitioning from Manual Logbooks to a Centralized Logistics ERP (CT-ERP)

1. Executive Summary: The Vision
The primary objective of the meeting was to define the "Golden Thread" of data integration. The CTC team seeks to move away from maintaining multiple manual registers (Day Book, Dispatch Register, Hire Memo, Bill Notebook, and Bank/Cash Books). The new system must ensure that data entered at the point of vehicle loading (the Dispatch Register) propagates automatically to the financial and tracking modules.

2. Operational Workflow & Functional Requirements
2.1. The Dispatch Cycle (Phase 1: Booking & Loading)
Initial Entry: The process begins with an order being logged in the Day Book.

LR Generation: Once a vehicle is loaded at the site, a Lorry Receipt (LR) is created.

Document Uploads: The system must allow the site writer to upload digital copies of the LR, Party Invoice, and E-way Bill immediately upon dispatch.

LR Data Capture: Essential fields include LR No, Date, Consignor, Consignee, Qty, Vehicle No, and Origin/Destination.

2.2. Hire Memo & Vendor Costing (Phase 2: Execution)
The "Bhada Parchi": For third-party vehicles, a Hire Memo is generated to record the agreed freight rate with the broker.

Financial Terms: The system must capture the Total Hire Amount, any Advance Paid (Cash or Bank), and auto-calculate the Balance Due.

Driver Details: The Driver’s Name and License No must be recorded for legal and safety compliance.

2.3. Real-Time Tracking & E-way Bill Compliance
Daily Log: Tracking staff will log current vehicle locations and delivery status remarks every morning.

Critical E-way Bill Alerts: To prevent fines, the system must monitor the E-way Bill Expiry Date. If the vehicle is not marked "Delivered" in the system, a pop-up notification must trigger 8 hours before expiry (usually starting around 4 PM for midnight expirations) to prompt an extension.

2.4. Proof of Delivery (POD) & Closing the Cycle
POD Receipt: Physical POD copies arrive at the office via courier.

System Check: Staff must be able to "tick" or flag that the POD has been received for a specific LR to initiate billing.

Digital Archive: A digital version of the POD must be attached so it can be viewed at any time by searching the Vehicle or LR No.

3. Billing & Financial Reconciliation
3.1. Complex Invoicing (Annexures)
Batch Selection: The system must support grouping multiple LRs into a single bill for certain corporate clients.

Automated Annexures: When an invoice is created, the system should automatically generate a detailed Annexure table listing all LR details, vehicle numbers, and specific freight per movement.

Variable Charges: Users must have the option to manually add Unloading, Detention, or Other Charges during the billing stage.

3.2. Vouchers & Bank Books
Debit Vouchers: Every cash/bank payment for advances or balances must generate a standardized Debit Voucher print-ready from the system.

Central Ledger: Daily entries in the software should auto-populate a Bank Book and Cash Book, eliminating manual ledger maintenance.

4. Master Data & System Intelligence
Supplier Master: A comprehensive database of brokers/owners including KYC (RC, PAN), vehicle types, and a history of rates paid over the last 3-5 years.

Contract Master: Store client-specific rates based on lanes (From/To) with a validity period. The system should flag when a contract is expiring.

Pending Billing Report: The system must generate a report of all movements older than 15-20 days that have not yet been billed.

5. Security & Deployment Strategy
Access Control: Define clear roles (Dispatch, Tracking, Accounts) with specific permissions. For instance, tracking staff should not have access to financial hire rates.

Deployment Phase: The system will start as a Web/Desktop application for the first 2-3 months to ensure data integrity before considering a mobile version.

Manual Parallel Run: The CTC team will maintain manual books alongside the software for a transition period to ensure "Date Integrity" and system confidence.

6. Action Items
[CTC/Abhishek]: Map each manual register field to the new system (Hire Memo vs. LR vs. Invoice).

[CTC/Abhishek]: Provide 5-10 complete cycle examples (LR -> Hire Memo -> POD -> Invoice -> Payment) for testing.

[Development/Sujoy]: Provide mockups for the Central Dispatch Register and Supplier Master screen.

meeting 2
2. Workflow Stages & Functional Requirements
A. Dispatch & LR Generation
Initial Entry: Every shipment begins with an order being logged. Once a vehicle is loaded, an LR (Lorry Receipt) is generated at the site.

Digital Attachments: At the point of LR creation, users must upload digital copies of the LR, the Party Invoice, and the E-way Bill to the portal.

Data Fields: Key fields include LR No, Date, Consignor, Consignee, No. of Articles, Vehicle No, and Route (From/To).

B. Hire Memo (Bhada Parchi) & Vendor Costs
Cost Tracking: For every vehicle hired through a broker, a Hire Memo is issued.

Financial Details: Capture the total agreed rate, cash/bank advances given, and the remaining balance.

Automation: This document must pull details (Vehicle No, LR No, Route) directly from the Dispatch Register to avoid re-typing.

C. Tracking & Alerts
Daily Status: Staff will log daily locations and remarks (e.g., "Current Location," "Delivered/Not Delivered").

E-way Bill Alert: The system must monitor E-way bill expiry dates. If a vehicle is not marked "Delivered," a notification must trigger 8 hours before expiry to allow for an extension.

D. Billing & Annexure Generation
POD Management: Once the signed Proof of Delivery (POD) is received, the LR is eligible for billing.

Multi-LR Billing: The system must allow users to select multiple LRs for a single customer and auto-generate an Annexure.

Automated Rates: Rates should be pulled from a Contract Master (for contractual clients) or entered as an Ad-hoc Rate.

Additional Charges: Fields for Unloading, Detention, and Other Charges must be available to add to the freight total.

E. Financial Vouchers & Bank Book
Daily Reconciliation: Cash and bank payments (advances/balances) should be logged daily.

Debit Vouchers: The system should generate print-ready debit vouchers linked to specific vehicle numbers for audit purposes.

3. Master Data Requirements
Supplier/Broker Master: A database of all vendors including KYC documents (RC, PAN), vehicle history, and historical rates for the last 3-5 years.

Client/Contract Master: Storage of customer-specific contractual rates with validity dates (e.g., Valid until March 31, 2026).

4. Security & Access Control
Role-Based Access: Defined logins for Dispatch, Tracking, and Accounts.

Permissions: Specific roles will have "View Only" or "Edit" permissions (e.g., tracking staff cannot see or edit hire rates).