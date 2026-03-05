# CTC-ERP: Comprehensive Gap Analysis
**Date**: 5 March 2026  
**Based on**: Initial Requirements → Development Done → Nikhil's Review + Sample Documents

---

## 1. METHODOLOGY

This analysis traces three layers:

| Layer | Source |
|-------|--------|
| **Initial Requirements** | `specs/001-core-erp/spec.md`, `plan.md`, `manual-register-mapping.md` |
| **Development Done** | Frontend: `/frontend/src/features/`, Backend: `/backend/app/` |
| **Client Review (Nikhil)** | Handwritten notes + Sample documents: Dispatch Register (xlsx), Bill Notebook (xlsx), Hire Memo (Empty + Filled PDF), Invoice (Empty, With Annexure, Without Annexure PDF), LR (Empty + Filled PDF) |

---

## 2. SAMPLE DOCUMENT ANALYSIS

### 2.1 Dispatch Register Sample (Excel — Sheet1)
**Actual columns in client's working register:**

| # | Column Name | Found in Current Implementation? |
|---|-------------|----------------------------------|
| 1 | LR.NO | ✅ Yes (`lr_number`) |
| 2 | DATE | ✅ Yes (`date`) |
| 3 | MONTH | ✅ Yes (computed) |
| 4 | CONSIGNOR | ✅ Yes (`consignor_name`) |
| 5 | CONSIGNEE | ✅ Yes (`consignee_name`) |
| 6 | NO. OF ARTICLES | ✅ Yes (`articles_count`) |
| 7 | DESCRIPTION | ✅ Yes (`articles_description`) |
| 8 | TYPE OF VEHICLE | ✅ Yes (`vehicle_type`) |
| 9 | VEHICLE NO. | ✅ Yes (`vehicle_number`) |
| 10 | ORIGIN | ✅ Yes |
| 11 | DESTINATION | ✅ Yes |
| 12 | FOB | ✅ Yes — but **WRONG data source** (uses Cities; should link to Party Master) |
| 13 | THROUGH | ✅ Yes (`through_id` → Vendor) |
| 14 | BILL NO | ✅ Yes (`bill_number`) |
| 15 | REMARKS | ✅ Yes |
| — | **EWAY BILL NO** | ⚠️ Exists as read-only computed column — **not editable, needs to be inline** |
| — | **EWAY BILL EXPIRY DATE** | ⚠️ Exists read-only — **must be visible by default** |
| — | **DRIVER NUMBER/MOBILE** | ❌ **Missing from grid** (field exists in DB: `driver_mobile`) |

**Key observations from real data:**
- Financial year shown in header: `DISPATCH REGISTER 2025-2026` — system must scope all data per FY
- LR numbers are pure integers (e.g., 45610, 45612) — current system uses `lr_number` as string ✅
- FOB values in sample data are city names like `SRICITY` — **but Nikhil confirmed it must link to Party Master**
- THROUGH values are broker/vendor names (e.g., `SBR`, `RADHEKRISHNA`, `MEENAKSHI`) — matches vendor lookup ✅
- BILL NO is a simple integer (e.g., 78) — represents the invoice number ✅

**Sheet2 + Sheet3**: Alternative view with columns: LR.NO, DATE, VEHICLE NO., ORIGIN, DESTINATION, REPORTED ON — this is an **ancillary tracking view**, possibly the "Reported" register for delivery confirmations. Not currently implemented.

---

### 2.2 Bill Notebook Sample (Excel)

**Sheet1 — Main Bill Notebook Header row:**

| Column | Maps to Current BillBook.tsx? |
|--------|------------------------------|
| BILL NO. | ✅ `bill_number` |
| DATE | ✅ `bill_date` |
| LR NO. | ✅ `lr_number` |
| LR DATE | ✅ `date` |
| ORIGIN | ✅ `origin` |
| DESTINATION | ✅ `destination` |
| CUSTOMER NAME | ✅ `customer_name` |
| AMOUNT | ✅ `amount` |
| AMOUNT PASSED | ✅ `amount_passed` |
| DEDUCTIONS | ✅ `deductions` |
| REMARKS | ✅ `remarks` |
| CM NO. | ✅ `cm_no` |
| CM DATE (of CM NO.) | ✅ `cm_date` |

**Sheet4 — PAYMENT REGISTER (CRITICAL DISCOVERY):**

| Column | Implemented? |
|--------|-------------|
| PAYMENT DATE | ❌ **Missing** — no Payment Receipts Register exists |
| AMOUNT | ❌ **Missing** |
| RECEIVED FROM | ❌ **Missing** |

> **Finding**: Sheet4 is the **Payment Receipts Register** the client requested. It records when payments were received from clients (e.g., "FLIPKART INDIA P LTD", "INSTAKART SERVICES P LTD") with dates and amounts. This is completely absent from both spec tasks and implementation.

**Multiple sheets = Multiple clients** (Sheet3 = FLYJAC data). The Bill Notebook is **per-client**, not a single global register. Current BillBook.tsx mixes all clients — this may need a client filter/tab view.

> **Finding**: Many Bill Notebook rows have `amount_passed = None`, `cm_no = None` — "pending" invoices. Current status field is `DRAFT`/`BILLED` but there's no explicit **PENDING PAYMENT** status to flag outstanding receivables. Nikhil's review confirms tracking "Net Amount", "TDS", "Balance" is needed.

---

### 2.3 Hire Memo Sample (PDF — Empty Template & Filled)

**All fields from the actual physical Hire Memo:**

| Field | Current HireMemo.tsx? | Notes |
|-------|-----------------------|-------|
| Hire Memo No. | ✅ `hire_memo_no` (manual) | ❌ Must be **auto-generated series**, no duplicates |
| Branch | ✅ `branch` | |
| Date | ✅ `hire_memo_date` | |
| Lorry No. (Vehicle) | ✅ `vehicle_number` | |
| Driver Name | ✅ `driver_name` | |
| No. of Articles | ✅ Linked from LR | |
| LR No. | ✅ Linked (`lr_id`) | |
| LR Dated | ✅ Loaded from LR | |
| From | ✅ `from_location` | |
| To | ✅ `to_location` | |
| Collect payment from (destination office) | ✅ `payment_location` | |
| Rate | ✅ `freight_rate` | |
| Freight to be paid | ✅ `total_amount` | |
| For Weight | ✅ `freight_weight` | |
| Total Amount | ✅ `total_amount` | |
| Less Part Payment | ✅ advance_cash + advance_bank | |
| Balance | ✅ auto-calculated `balance` | |
| Amount in words | ❌ **Missing** — printed form shows "Rupees ... only" | |
| Signature of Driver/Owner | ❌ **Missing** from UI | |
| Licence No. | ✅ `driver_license` | |
| Deduct Rs. on account of | ✅ via `other_deductions` + notes | |

**From Filled PDF (HM No. 48492):**
- Rate type shown as "32 XL" (matches vehicle type codes from dispatch register)
- Total Amount: Rs. 1,05,000
- Advance: Rs. 96,000
- Balance: Rs. 9,000
- Collected from destination office — confirms `payment_location` is used

**Print requirement (Nikhil Review #2.ii):**
- **2 copies needed**: "Original Copy" and "Book Copy"
- Currently: single `printHireMemo()` function — no copy type differentiation
- Physical form shows "For Chandra Transport Corporation" signature + "I/We confirm and acknowledge the above" + Driver Signature section → PDF print must include both halves

---

### 2.4 Invoice Samples (PDF — Empty, Filled With Annexure, Filled Without Annexure)

#### Invoice Header Fields (from all samples):

| Field | Implemented (BillBook/Billing)? | Notes |
|-------|---------------------------------|-------|
| Company header (CTC logo, PAN, GSTIN) | ❌ Not in invoice generation | Static header needed in PDF |
| Invoice No. | ❌ Not auto-generated | Format from sample: `1543/25-26` → **FY-based numbering** |
| Invoice Date | ❌ | |
| BILL TO (name + address + GST) | ❌ | Needs Party master lookup |
| Description (Transportation Charges From X) | ❌ | |
| PO NUMBER + PO DATE | ❌ | New field not in spec |
| LR NO, DATE, QTY/NOS, PARTICULARS, V.TYPE, VEHICLE NO., FROM, TO, AMOUNT | ❌ | Line item per LR |
| C'GNR (Consignor) | ❌ | Columns required |
| C'GNEE (Consignee) | ❌ | Columns required |
| LESS: SEAL COST (deduction line) | ❌ | Inline deduction support needed |
| TOTAL | ❌ | |
| RUPEES (amount in words) | ❌ | |
| HSN CODE | ❌ Not in billing fields | `996791` — standard for transport |
| REMARKS: "GST PAYABLE BY [CUSTOMER]" | ❌ | **Reverse charge mechanism** |
| TAX PAYABLE ON REVERSE CHARGES (YES/NO) | ❌ | Confirmed YES in sample |
| BANK DETAIL (ICICI Bank, Branch, IFSC, A/c) | ❌ | Static company bank detail |
| Authorised Signatory section | ❌ | |

#### Invoice WITHOUT Annexure (sample: Bill 1568/2025-26):
- LR lines listed **directly in the invoice table** with individual amounts
- Each LR: LR NO, DATE, QTY, PARTICULARS (description), V.TYPE, Vehicle No., FROM, TO, AMOUNT
- Supports **inline deductions** per LR line (e.g., "LESS: SEAL COST -20.00")
- 2 LRs in this sample → total Rs. 1,23,960

#### Invoice WITH Annexure (sample: Bill 1543/25-26):
- Invoice body shows only: `"As per annexure enclosed"` with total amount Rs. 1,85,160
- Separate **ANNEXURE page** with full LR breakdown

**Annexure columns (from sample):**
| Column | Notes |
|--------|-------|
| S.NO | Serial number |
| LR NO (IS MO in scan) | LR Number |
| DATE | LR Date |
| QTY | Quantity |
| CONSIGNEE | Consignee name |
| FROM | Origin |
| TO | Destination |
| FREIGHT | Base freight amount |
| LOADING DETENTION | Loading detention charges |
| CHARGES LOADED ON | Date loaded |
| UNLOADING CHARGES | Unloading charges |
| UNLOADING DETENTION | Unloading detention |
| OTHER CHARGES | Other charges |
| TOTAL | Sum of charges per LR |
| REMARKS | Notes |
| PLACED ON | When placed |

**Key pattern**: Invoice No. format is `1543/25-26` — this is `<sequential_no>/<financial_year_short>`. Current system has no invoice number generation at all.

---

### 2.5 Lorry Receipt Sample (PDF — Empty Template & Filled)

**Fields on physical LR (Empty template):**

| Field | Implemented in CreateLR? |
|-------|--------------------------|
| Lorry Receipt No. | ✅ |
| Consignor | ✅ |
| Consignee | ✅ |
| Date | ✅ |
| From / To | ✅ origin/destination |
| No. of Articles | ✅ |
| Description of Goods | ✅ |
| Delivery at | ✅ |
| Weight (QTL + KG) | ✅ |
| Rate Per QTL | ✅ freight_rate |
| Freight (Rs.) | ✅ |
| SEAL No. | ✅ |
| AT LOADING POINT — In Date/Time, Out Date/Time | ✅ `loading_point_times` JSONB |
| Value Rs. | ✅ |
| Surcharge | ✅ |
| Hamali Charges | ✅ |
| St. Charges | ✅ |
| TOTAL | ✅ |
| Booked on Owner's Risk | ✅ |
| VEHICLE No. | ✅ |
| **DRIVER MOBILE NUMBER** | ❌ **Missing from LR print** (exists in DB) |
| **E-WAY BILL NUMBER** | ❌ **Missing from LR print** |

**From Filled LR**: LR No. 49173, shows hand-written origin/destination/consignor/consignee confirming current model has all relevant fields.

---

## 3. CROSS-REFERENCE GAP ANALYSIS

### 3.1 DISPATCH REGISTER

| Gap ID | Nikhil's Comment | Sample Evidence | Current State | Severity |
|--------|-----------------|----------------|---------------|----------|
| DR-01 | "Driver Number to be added in Dispatch column" | LR template has Driver Mobile field; DR sample missing it | `driver_mobile` in DB but **not shown** in grid | 🔴 CRITICAL |
| DR-02 | "Eway Bill No. & Eway Bill expiry date to be added in Dispatch column" | DR sample has no E-Way columns; Nikhil confirms need | Grid has EWAY NO + EWAY EXPIRY as read-only | ⚠️ Partial — needs default visibility |
| DR-03 | "Dispatch Register columns to be added as per sample given" | 15 exact columns confirmed | All 15 columns exist ✅ | 🟢 Good |
| DR-04 | "Party Master ← [FOB column in Dispatch Register]" | Sample FOB = "SRICITY" (a location/party); currently uses city list | FOB uses `citiesList` not parties | 🔴 CRITICAL — wrong data source |
| DR-05 | "All data must be according to Financial Year" | Sheet header: *DISPATCH REGISTER 2025-2026* — year scoped | No FY field, no FY filter, no FY segregation | 🔴 CRITICAL |

---

### 3.2 HIRE MEMO ENTRY

| Gap ID | Nikhil's Comment | Sample Evidence | Current State | Severity |
|--------|-----------------|----------------|---------------|----------|
| HM-01 | "HM entry from LR Number" | Filled HM references LR No. 43/H9. Entry triggered by LR | ✅ Works via `?lr_id=` param. Must also have standalone entry. | 🟢 OK |
| HM-02 | "Driver names & Freight rates to be added manually" | Empty template: Rate, Freight fields are blank (manual fill) | ✅ Fields exist but may not be clearly manual | 🟡 Minor |
| HM-03 | "2 prints needed — Original copy & Book copy" | Physical form has two tear-off sections | Single print only (`printHireMemo`) | 🔴 CRITICAL |
| HM-04 | "Hire Memo Number should not be Duplicate [in the series given]" | HM No. 48492 / 48698 — sequential, no gaps | Manual text entry — zero validation | 🔴 CRITICAL |
| HM-05 | "Every Hire Memo print show we should be able to trace" | Physical form is accountability document | No print audit log | 🔴 CRITICAL |
| HM-06 | FY segregation | Hire memos are yearly documents | No FY field on hirememo table | 🔴 CRITICAL |
| HM-07 | Amount in words missing | Filled HM: "Rupees ... only" printed on form | `printHireMemo` lacks `amount_in_words` | 🟡 HIGH |

---

### 3.3 HIRE MEMO REGISTER (NEW SCREEN — DOES NOT EXIST)

| Gap ID | Nikhil's Comment | Sample Evidence | Current State | Severity |
|--------|-----------------|----------------|---------------|----------|
| HMR-01 | "Hire Memo Register creation" screen needed | No Excel sample provided but columns specified | ❌ No screen exists | 🔴 CRITICAL |
| HMR-02 | Column: HM No. | From HM form | ❌ | 🔴 CRITICAL |
| HMR-03 | Column: HM Date | From HM form | ❌ | 🔴 CRITICAL |
| HMR-04 | Column: Vehicle No. | From HM form | ❌ | 🔴 CRITICAL |
| HMR-05 | Column: Total Hire | `total_amount` from HM | ❌ | 🔴 CRITICAL |
| HMR-06 | Column: Hire Paid (Advance) | `advance_cash + advance_bank` | ❌ | 🔴 CRITICAL |
| HMR-07 | Column: Payment Date | Date advance was paid | ❌ No payment_date field in HireMemo model | 🔴 CRITICAL |
| HMR-08 | Column: Balance Amount | `balance` = Total - Paid | ❌ | 🔴 CRITICAL |
| HMR-09 | Column: Balance Payment Date | Date balance was paid (manual fill) | ❌ No field exists | 🔴 CRITICAL |
| HMR-10 | Column: Capacitor (Manually filled) | Likely "CAPACITY" (vehicle capacity/load) or broker commission — **needs clarification** | ❌ No field | 🔴 NEEDS CLARIFICATION |
| HMR-11 | "Broker name" + "TDS declaration to be picked from Vendor Master" | VendorMaster has `tds_certificate_url` + `name` | ❌ HireMemo has no broker_id FK | 🔴 CRITICAL |

---

### 3.4 PARTY MASTER (Client Master)

| Gap ID | Nikhil's Comment | Sample Evidence | Current State | Severity |
|--------|-----------------|----------------|---------------|----------|
| PM-01 | "Party Master ← linked to FOB column in Dispatch Register" | Sample FOB = party/location name | FOB uses city list, not Party | 🔴 CRITICAL |
| PM-02 | Party = "Client" per client's terminology | Sample: "HAVELLS INDIA LTD", "LIFESTYLE INTERNATIONAL" appear in invoice BILL TO | `PartyMaster.tsx` exists with CUSTOMER/CONSIGNOR/CONSIGNEE types | 🟡 Rename label to "Client Master" |
| PM-03 | Party must include GST NO for invoice generation | Invoice samples show GST on BILL TO section | `gstin` field exists ✅ but needed for invoice | 🟢 OK |

---

### 3.5 VENDOR MASTER

| Gap ID | Nikhil's Comment | Sample Evidence | Current State | Severity |
|--------|-----------------|----------------|---------------|----------|
| VM-01 | "Vendor Master ← just remove GST" | Vendors are brokers/transporters who don't charge GST (they're on reverse charge) | `VendorMaster.tsx` has GSTIN column and field | 🔴 CRITICAL — remove GSTIN |
| VM-02 | Broker name in Hire Memo Register from Vendor Master | THROUGH column in DR = broker name (SBR, RADHEKRISHNA etc.) | Vendor model has `name` ✅ but no link to HireMemo | 🔴 CRITICAL — add broker FK to HireMemo |
| VM-03 | TDS declaration from Vendor Master | TDS certificate URL exists in model | `tds_certificate_url` is a URL string — display as YES/NO flag in register | 🟡 HIGH |
| VM-04 | Vendor `type` field needs "BROKER" type option | THROUGH vendors are brokers | `type` field exists but "BROKER" may not be listed | 🟡 HIGH |

---

### 3.6 INVOICE CREATION (NEW — DOES NOT EXIST)

| Gap ID | Nikhil's Comment / Sample Evidence | Current State | Severity |
|--------|-------------------------------------|---------------|----------|
| INV-01 | Invoice No. format `1543/25-26` — FY-based, sequential | ❌ No invoice number generation | 🔴 CRITICAL |
| INV-02 | Invoice with Annexure mode | ❌ BillBook.tsx is a register, not invoice creation | 🔴 CRITICAL |
| INV-03 | Invoice without Annexure mode (LR lines inline) | ❌ | 🔴 CRITICAL |
| INV-04 | "GST to be paid by recipient of the services" | Sample: `REMARKS: GST PAYABLE BY HAVELLS INDIA LTD` + `TAX PAYABLE ON REVERSE CHARGES: YES` | ❌ Not in spec or implementation | 🔴 CRITICAL |
| INV-05 | HSN CODE: 996791 (standard transport code) | Sample confirmed | ❌ No HSN code in implementation | 🔴 CRITICAL |
| INV-06 | PO NUMBER + PO DATE on invoice | Sample: `PO NUMBER: 119454 / PO DATE: 16.12.2025` | ❌ Not in spec, not in DB model | 🔴 CRITICAL — new field needed |
| INV-07 | BILL TO with full address + GST from Party Master | Sample shows full address block | ❌ Party model has address + gstin but not used for invoice | 🟡 HIGH |
| INV-08 | BANK DETAIL static section on invoice PDF | Sample: ICICI Bank, IFSC ICIC0004121, A/c 777705252729 | ❌ Not configurable in system | 🟡 HIGH |
| INV-09 | Inline deductions per LR line (e.g., LESS: SEAL COST) | Without-annexure invoice shows -20.00 per LR | ❌ Not supported | 🟡 HIGH |
| INV-10 | Amount in words on invoice | Sample: "RUPEES ONE LAKH TWENTY THREE..." | ❌ Not implemented | 🟡 HIGH |
| INV-11 | Annexure columns: S.NO, LR NO, DATE, QTY, CONSIGNEE, FROM, TO, FREIGHT, LOADING DETENTION, UNLOADING CHARGES, UNLOADING DETENTION, OTHER CHARGES, TOTAL, REMARKS, PLACED ON, LOADED ON | Partial spec in `manual-register-mapping.md` | ❌ Not built | 🔴 CRITICAL |
| INV-12 | "ST. 5%" | Nikhil's review mentions "ST 5%" — likely Service Tax or surcharge percentage | ❌ Not clear | 🔴 NEEDS CLARIFICATION |

---

### 3.7 INVOICE REGISTER (Bill Notebook → Invoice Register)

| Gap ID | Nikhil's Comment / Sample | Current State | Severity |
|--------|---------------------------|---------------|----------|
| IR-01 | Invoice Register columns: Total Amount - TDS - Any other deduction = **Net Amount** | No TDS, no Net Amount | 🔴 CRITICAL |
| IR-02 | "Remarks" column | ✅ Exists in BillBook | 🟢 OK |
| IR-03 | TDS deduction tracking | ❌ Not in BillBook.tsx | 🔴 CRITICAL |
| IR-04 | Net Amount = Total - TDS - Other | ❌ No calculated column | 🔴 CRITICAL |
| IR-05 | Invoice register must separate by client (Sheet per client in Excel sample) | Single mixed view | 🟡 HIGH — add client filter |
| IR-06 | Outstanding/Pending tracking | Sample has many rows with null `amount_passed` | `status` field exists but no PENDING logic | 🟡 HIGH |

---

### 3.8 PAYMENT RECEIPTS REGISTER (NEW — DOES NOT EXIST)

| Gap ID | Sample Evidence | Current State | Severity |
|--------|----------------|---------------|----------|
| PRR-01 | Bill Notebook **Sheet4** has: PAYMENT DATE, AMOUNT, RECEIVED FROM | ❌ No screen, no model, no API | 🔴 CRITICAL |
| PRR-02 | Payments linked to client (Sheet4 shows Flipkart, Instakart) | ❌ No payment-to-invoice linkage | 🔴 CRITICAL |
| PRR-03 | Payment enables "Amount Passed" + "CM No." update on Invoice Register | Flow: payment → update bill notebook row | ❌ Manual only currently | 🟡 HIGH |

---

## 4. SUMMARY SCORECARD

### Screen-by-Screen Status

| # | Screen | Spec Coverage | Tasked | Implemented | Nikhil Review Status |
|---|--------|--------------|--------|-------------|---------------------|
| 1 | Dispatch Register | ✅ Full | ✅ T011-T018 | ✅ Done | 🔴 3 gaps (driver col, FOB source, FY) |
| 2 | Hire Memo Entry | ✅ Full | ✅ T019-T023 | ✅ Done | 🔴 4 gaps (2 prints, series, audit, FY) |
| 3 | Hire Memo Register | ❌ Missing | ❌ No tasks | ❌ Missing | 🔴 New screen needed |
| 4 | Client Master (Party) | ✅ Partial | ✅ T024-T028 | ✅ Done | 🟡 FOB linkage, rename label |
| 5 | Vendor Master | ✅ Partial | ✅ T026 | ✅ Done | 🔴 Remove GSTIN, add broker FK |
| 6 | Invoice Creation | ✅ Spec only | ⚠️ T036-T038 | ❌ Not built | 🔴 Entire screen missing |
| 7 | Invoice Register | ✅ Partial | ⚠️ T036-T038 | ⚠️ BillBook.tsx partial | 🔴 TDS, Net Amount missing |
| 8 | Payment Receipts Register | ❌ Missing | ❌ No tasks | ❌ Missing | 🔴 New screen needed |

### Gap Count by Severity

| Severity | Count | Screens Affected |
|----------|-------|-----------------|
| 🔴 CRITICAL | 28 | All 8 screens |
| 🟡 HIGH | 12 | 6 screens |
| 🟢 Low/OK | 18 | — |
| ❓ Needs Clarification | 3 | Invoice, HM Register |

---

## 5. ITEMS NEEDING CLARIFICATION FROM CLIENT

| # | Topic | Question | Where Used |
|---|-------|----------|-----------|
| C1 | **"Capacitor"** in Hire Memo Register | Is this "Capacity" (vehicle load capacity), a commission agent reference, or something else? | Hire Memo Register column |
| C2 | **"ST. 5%"** in Invoice | Is this a 5% Service Tax legacy field, or a standard 5% surcharge? Should it appear on every invoice? | Invoice Creation |
| C3 | **FOB → Party Master** | Should FOB show ALL parties or only CONSIGNOR type? Can it be typed manually if not in master? | Dispatch Register |
| C4 | **TDS in Invoice Register** | Is TDS a fixed percentage deducted by the client? Should system pre-calculate it from a vendor/client rate? | Invoice Register |
| C5 | **Balance Payment Date** in Hire Memo Register | Is this filled manually after payment is made, or should it be auto-filled from a payment transaction? | Hire Memo Register |
| C6 | **Print numbering** | Should Original Copy be numbered and Book Copy be a carbon copy, or should both show the same HM number? | Hire Memo Print |

---

## 6. PRIORITISED NEXT STEPS

### SPRINT 1 — Backend Schema & Data Foundation (Week 1)

> All database changes required as foundation for UI work.

- [ ] **S1-01** Add `financial_year` VARCHAR(7) to `lrs`, `hirememos` tables. Default to `'2025-26'` for existing rows. Add DB index. Write migration.
- [ ] **S1-02** Add `broker_id` INTEGER FK to `hirememos` referencing `vendors.id`. Write migration.
- [ ] **S1-03** Add `payment_date` DATE, `balance_payment_date` DATE, `capacitor` VARCHAR to `hirememos`. Write migration.
- [ ] **S1-04** Remove `gstin` column from `vendors` table. Write migration.
- [ ] **S1-05** Add `tds_declaration` BOOLEAN (DEFAULT FALSE) to `vendors` table. Migrate existing `tds_certificate_url` → derive boolean. Write migration.
- [ ] **S1-06** Create `invoices` table: `id`, `invoice_no` (format `{seq}/{fy_short}`, unique), `invoice_date`, `party_id` FK, `po_number`, `po_date`, `description`, `hsn_code`, `reverse_charge` BOOLEAN, `total_amount`, `tds_amount`, `other_deductions`, `net_amount`, `remarks`, `financial_year`, `has_annexure` BOOLEAN, `status`, timestamps.
- [ ] **S1-07** Create `invoice_line_items` table: `id`, `invoice_id` FK, `lr_id` FK (nullable for manual lines), `lr_number`, `lr_date`, `qty`, `particulars`, `vehicle_type`, `vehicle_number`, `from_location`, `to_location`, `freight`, `seal_cost`, `loading_detention`, `unloading_charges`, `unloading_detention`, `other_charges`, `line_total`, `consignor`, `consignee`, `placed_on`, `loaded_on`.
- [ ] **S1-08** Create `payment_receipts` table: `id`, `receipt_no` (unique, auto-generated), `receipt_date`, `invoice_id` FK (nullable for advance payments), `party_id` FK, `amount`, `mode` (`CASH`/`BANK`/`CHEQUE`/`NEFT`/`RTGS`), `bank_ref`, `financial_year`, `remarks`, timestamps.
- [ ] **S1-09** Create `print_logs` table: `id`, `entity_type` VARCHAR, `entity_id` INT, `copy_type` VARCHAR (ORIGINAL/BOOK), `printed_by` INT FK users, `printed_at` TIMESTAMP. Write migration.
- [ ] **S1-10** Update Pydantic schemas for all modified models (HireMemo, Vendor, new Invoice, InvoiceLineItem, PaymentReceipt).

### SPRINT 2 — API Layer (Week 1–2)

- [ ] **S2-01** Update `GET /api/lr/` to accept `?financial_year=` filter. Update `POST /api/lr/` to save `financial_year`.
- [ ] **S2-02** Update `GET /api/hirememo/` and `POST /api/hirememo/` to support `financial_year`, `broker_id`, `payment_date`, `balance_payment_date`, `capacitor`.
- [ ] **S2-03** Add `GET /api/hirememo/register?financial_year=` endpoint returning list view with joined broker name, TDS flag, computed balance.
- [ ] **S2-04** Update `GET /api/vendor/`, `POST`, `PUT` — remove GSTIN, add `tds_declaration` boolean.
- [ ] **S2-05** Create Invoice API: `POST /api/invoice/` (create with line items), `GET /api/invoice/` (list, filterable by client/FY), `GET /api/invoice/{id}` (detail), `PUT /api/invoice/{id}`.
- [ ] **S2-06** Create Invoice Number Generator service: next sequence per FY (e.g., `1/25-26`, `2/25-26`..., `1543/25-26`).
- [ ] **S2-07** Create Payment Receipts API: `POST /api/payment-receipt/`, `GET /api/payment-receipt/`, `GET /api/payment-receipt/?invoice_id=`, `PUT`.
- [ ] **S2-08** Create Print Log API: `POST /api/print-log/` (called by frontend after each print), `GET /api/print-log/?entity_type=HIRE_MEMO&entity_id=`.
- [ ] **S2-09** Add `GET /api/party/` filter for `type=CONSIGNOR` to support FOB dropdown (returns Party names, not city names).

### SPRINT 3 — Frontend Fixes to Existing Screens (Week 2)

- [ ] **S3-01** **Dispatch Register** — Add `driver_mobile` column to grid (data exists in backend).
- [ ] **S3-02** **Dispatch Register** — Change FOB dropdown source from `citiesList` to `partiesList` (from `GET /api/party/`).
- [ ] **S3-03** **Dispatch Register** — Add FY selector to header; filter `GET /api/lr/?financial_year=` on load. Default to current FY.
- [ ] **S3-04** **Dispatch Register** — Ensure EWAY NO and EWAY EXPIRY columns are **pinned/visible by default** (not hidden).
- [ ] **S3-05** **Hire Memo Entry** — Add `broker_id` selector (dropdown from Vendor Master, type=BROKER).
- [ ] **S3-06** **Hire Memo Entry** — Add `payment_date` and `balance_payment_date` fields.
- [ ] **S3-07** **Hire Memo Entry** — Add `capacitor` field (pending clarification — add as free-text for now).
- [ ] **S3-08** **Hire Memo Entry** — Add `amount_in_words` auto-calculated display field for print.
- [ ] **S3-09** **Hire Memo Entry** — Replace single print button with "Print Original" + "Print Book Copy" — each logs to `print_logs` API after printing.
- [ ] **S3-10** **Hire Memo Entry / Auto-Numbering** — Fetch next HM number from API (`GET /api/hirememo/next-number?financial_year=`) on new memo creation. Show in field (editable but pre-filled). Add duplicate check on save.
- [ ] **S3-11** **Vendor Master** — Remove GSTIN column + field. Add `tds_declaration` boolean checkbox column.
- [ ] **S3-12** **Bill Notebook (Invoice Register)** — Add `tds_amount` editable column. Add computed `net_amount = amount - tds_amount - deductions` column. Add client filter/search.

### SPRINT 4 — New Screens (Week 3–4)

- [ ] **S4-01** **Hire Memo Register** (`/operations/hirememo-register`) — Grid with columns: HM No, HM Date, Vehicle No, LR No (linked), Total Hire, Hire Paid (Advance), Payment Date, Balance Amount, Balance Payment Date, Capacitor, Broker Name, TDS Declaration (Yes/No). Filterable by FY, broker, date range. Editable: Payment Date, Balance Payment Date, Capacitor (manual cols).
- [ ] **S4-02** **Invoice Creation** (`/finance/invoices/create`) — Form with: Party selector (BILL TO), FY selector, auto-generated invoice number, PO No + PO Date, With/Without Annexure toggle, LR selector (multi-select from Dispatch Register for current FY + party), per-LR charge editing (freight, seal cost, detention, unloading, other), reverse charge checkbox, HSN Code (default 996791), Bank Detail section (editable company-level config), PDF preview + download.
- [ ] **S4-03** **Invoice Register** (`/finance/invoices`) — Replaces/extends BillBook. Columns: Invoice No, Invoice Date, Party, Total Amount, TDS, Other Deductions, Net Amount, Status, CM No, CM Date, Remarks. Filter by FY, party, status (DRAFT/SENT/PARTIALLY_PAID/PAID). Link to Payment Receipts.
- [ ] **S4-04** **Payment Receipts Register** (`/finance/payment-receipts`) — Columns: Receipt No (auto), Receipt Date, Party Name, Invoice Ref, Amount, Mode (Cash/Bank/NEFT/RTGS), Bank Ref, FY, Remarks. Entry form. Triggers update of linked invoice status.

### SPRINT 5 — Quality & Cross-Cutting (Week 5)

- [ ] **S5-01** FY utility: `getCurrentFinancialYear()`,  `getFYList()`, `getFYDateRange(fy)` — shared frontend util and backend dependency.
- [ ] **S5-02** `amount_in_words` utility (Indian number system: Lakhs, Crores) — used in HM print and Invoice PDF.
- [ ] **S5-03** Hire Memo print templates — two HTML/CSS print templates: "ORIGINAL COPY" (with full company header) and "BOOK COPY" (same but marked "OFFICE COPY").
- [ ] **S5-04** Invoice PDF generation — render invoice and optional annexure as PDF using template engine (Handlebars/Jinja2), using company bank details from config.
- [ ] **S5-05** Company Bank Detail configuration screen or `.env` config (`COMPANY_BANK_NAME`, `COMPANY_IFSC`, `COMPANY_ACCOUNT_NO`) — referenced in all invoice PDFs.
- [ ] **S5-06** End-to-end test: Dispatch LR → Create Hire Memo (auto-number) → Print Original → Print Book Copy → Create Invoice (with Annexure) → Record Payment → Check Invoice Register Net Amount.
- [ ] **S5-07** Update `spec.md` to incorporate all Nikhil review requirements (FY, 2 copies, series, Payment Register, Invoice creation spec).
- [ ] **S5-08** Update `tasks.md` with Sprint 1–5 tasks above as Phase 9 (Post-Review).

---

## 7. FIELD-LEVEL DELTA TABLE (New Fields Required)

| Entity | New Field | Type | Source/Notes |
|--------|-----------|------|--------------|
| `lrs` | `financial_year` | VARCHAR(7) | e.g., `'2025-26'` |
| `hirememos` | `financial_year` | VARCHAR(7) | |
| `hirememos` | `broker_id` | INT FK vendors | Broker who arranged vehicle |
| `hirememos` | `payment_date` | DATE | Date advance was paid |
| `hirememos` | `balance_payment_date` | DATE | Date balance was paid |
| `hirememos` | `capacitor` | VARCHAR(128) | Pending clarification |
| `vendors` | `tds_declaration` | BOOLEAN | Replace `tds_certificate_url` or add alongside |
| `vendors` | ~~`gstin`~~ | **REMOVE** | Per Nikhil review |
| `invoices` (NEW) | `invoice_no` | VARCHAR `{seq}/{fy}` | System-generated |
| `invoices` | `party_id` | INT FK parties | Bill To address |
| `invoices` | `po_number` | VARCHAR | Client PO reference |
| `invoices` | `po_date` | DATE | Client PO date |
| `invoices` | `hsn_code` | VARCHAR | Default `996791` |
| `invoices` | `reverse_charge` | BOOLEAN | GST reverse charge flag |
| `invoices` | `tds_amount` | NUMERIC | Deduction |
| `invoices` | `other_deductions` | NUMERIC | Other deductions |
| `invoices` | `net_amount` | NUMERIC | Total - TDS - Other |
| `invoices` | `has_annexure` | BOOLEAN | Invoice type flag |
| `invoices` | `financial_year` | VARCHAR(7) | |
| `invoice_line_items` (NEW) | All annexure fields | — | See Sprint 1-07 |
| `payment_receipts` (NEW) | All | — | See Sprint 1-08 |
| `print_logs` (NEW) | All | — | See Sprint 1-09 |

---

*Generated on 5 March 2026 — based on sample document extraction + Nikhil review notes + current codebase analysis.*
