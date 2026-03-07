# Research: CTC-ERP Core (001-core-erp)

**Phase**: 0 — Research  
**Date**: 2026-03-05  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## 1. INR Amount-in-Words

**Decision**: Custom Python utility (`amount_in_words.py`, ~40 LOC)

**Rationale**: No PyPI package reliably handles Indian number system (lakh, crore, paise). The two most-referenced packages (`num2words`, `inflect`) output Western thousands/millions, not Indian lakh/crore. A bespoke function is idiomatic for logistics invoices: e.g., "Rupees One Lakh Five Thousand Only".

**Alternatives considered**:
- `num2words` — outputs e.g. "one hundred five thousand"; not usable for Indian invoices
- `inflect` — English-only, no currency support
- External microservice — disproportionate for 40 LOC

**Implementation sketch**:
```python
ONES = ["", "One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
        "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
        "Seventeen","Eighteen","Nineteen"]
TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"]

def _words(n: int) -> str:
    if n < 20: return ONES[n]
    if n < 100: return TENS[n//10] + (" " + ONES[n%10] if n%10 else "")
    if n < 1000: return ONES[n//100] + " Hundred" + (" and " + _words(n%100) if n%100 else "")
    if n < 100_000: return _words(n//1000) + " Thousand" + (" " + _words(n%1000) if n%1000 else "")
    if n < 10_000_000: return _words(n//100_000) + " Lakh" + (" " + _words(n%100_000) if n%100_000 else "")
    return _words(n//10_000_000) + " Crore" + (" " + _words(n%10_000_000) if n%10_000_000 else "")

def inr_words(amount: Decimal) -> str:
    rupees, paise = divmod(round(amount * 100), 100)
    result = "Rupees " + _words(int(rupees))
    if paise: result += f" and {_words(int(paise))} Paise"
    return result + " Only"
```

---

## 2. FY-Scoped Auto-Numbering

**Decision**: `SELECT COUNT(*) + 1 FROM table WHERE financial_year = :fy` at insert time, with `UNIQUE(number, financial_year)` DB constraint.

**Rationale**: Simple and correct for low-concurrency (≤10 users). The DB UNIQUE constraint is the definitive race-condition guard — if two transactions race, one gets an IntegrityError and retries.

**Alternatives considered**:
- PostgreSQL sequences per FY: requires dynamic sequence creation, DDL on April 1 — overly complex
- Redis atomic counter: adds an infrastructure dependency for a low-concurrency feature
- Application-level lock (threading.Lock): doesn't work across multiple workers

**FY calculation**:
```python
def get_current_fy() -> str:
    today = date.today()
    year = today.year if today.month >= 4 else today.year - 1
    return f"{year}-{str(year+1)[2:]}"      # e.g. "2025-26"

def fy_from_date(d: date) -> str:
    year = d.year if d.month >= 4 else d.year - 1
    return f"{year}-{str(year+1)[2:]}"
```

**Invoice number format**: `{seq}/25-26` e.g. `1543/25-26`

**HireMemo number format**: plain integer per FY (e.g. `1`, `2`, … `347`), resets to `1` on April 1

---

## 3. Invoice PDF Generation

**Decision**: Handlebars frontend template + `window.print()` (same pattern as existing `printHireMemo.ts` and `printLR.ts`)

**Rationale**: The codebase already uses Handlebars `.hbs` templates compiled in the browser (`printHireMemo.ts`, `printLR.ts`). Adopting the same pattern for invoices and vouchers gives zero new dependencies, no backend round-trip for print, and a consistent developer mental model. The 16-column landscape annexure table is achievable with CSS `@media print`. Users print via the browser dialog and save as PDF natively.

**Alternatives considered and rejected**:
- ReportLab (backend): Adds a Python dependency and a separate rendering engine. Inconsistent with existing LR/HireMemo print pattern already in production.
- WeasyPrint: HTML-to-PDF on server — same architectural inconsistency as ReportLab, plus GTK/Pango build complexity on Linux
- jsPDF (frontend): Works but adds a JS dependency; less readable template authoring vs. plain HTML/CSS in `.hbs`

**Implementation pattern** (mirrors `printHireMemo.ts`):
```
frontend/src/templates/invoice-template.hbs  ← HTML/CSS with {{handlebars}} tokens
frontend/src/utils/printInvoice.ts           ← compiles template, formats data, window.open() + window.print()
frontend/src/templates/voucher-template.hbs  ← same pattern for debit vouchers
frontend/src/utils/printVoucher.ts
```

**Invoice print structure** (matches sample doc):
1. Company header (name, PAN, GSTIN, address, ICICI bank details)
2. "BILL TO" block (client name, address, GSTIN)
3. Invoice No (auto-generated), Invoice Date, PO No, PO Date
4. HSN Code: `996791`
5. 16-column annexure table per LR line (CSS landscape `@media print`)
6. Deduction lines (SEAL COST etc.)
7. Total + "Amount in Words" (via `inrWords()` from `utils/amountInWords.ts`)
8. GST PAYABLE BY [client] / TAX ON REVERSE CHARGE: YES
9. Authorised Signatory

---

## 4. `financial_year` Field Design

**Decision**: `VARCHAR(7) NOT NULL DEFAULT '2025-26'` on all register tables (`lrs`, `hirememos`, `invoices`, `bills`, `payment_receipts`)

**Rationale**: String format `YYYY-YY` (e.g. `2025-26`) matches all sample documents and existing manual registers. Sortable lexicographically. No need for a FK to a FY master table — the format is self-describing.

**Migration strategy**: `DEFAULT '2025-26'` backfills all existing rows with current FY. New rows computed from record date via `fy_from_date()`.

**Alternatives considered**:
- `INTEGER year` (just the April-start year): requires derivation to display — less readable
- FK to `financial_years` master table: adds unnecessary join for a low-cardinality enum

---

## 5. Reverse Charge Mechanism

**Decision**: Two fields on `invoices`: `reverse_charge BOOLEAN DEFAULT FALSE` + `gst_paid_by VARCHAR(255)`

**Rationale**: Sample invoice shows "GST PAYABLE BY [CLIENT NAME]" and "TAX PAYABLE ON REVERSE CHARGES: YES". A boolean captures the YES/NO, and `gst_paid_by` stores the client name string that appears on the invoice. This is sufficient for display; no GST calculation logic needed server-side (transport GST under RCM is paid by recipient).

**Alternatives considered**:
- Enum `ReverseChargeType`: premature — only one type of RCM applies to transport services
- Separate `GSTDetails` table: premature normalisation

---

## 6. Per-Client BillBook Tabs

**Decision**: `client_id INTEGER FK` filter on `bills`/`invoices` table + tab UI in `BillBook.tsx`

**Rationale**: `client` model already exists with full name/GSTIN. No denormalization needed. Tab UI loads unique `client_id` values from Invoices and renders one tab per client, filtering the grid on selection.

**Implementation**: Backend `GET /api/billing/invoices?client_id=X&fy=2025-26`; frontend tabs built from `GET /api/client/` response filtered to clients that have invoices in the current FY.

---

## 7. HireMemo 2-Copy Print

**Decision**: CSS `@media print` two-section vertical layout on a single portrait page

**Rationale**: Zero extra dependencies. Both sections (Original Copy, Book Copy) are rendered in the DOM and hidden on screen; only visible in print mode. A CSS `page-break-inside: avoid` on each section keeps them together. Widely supported in all browsers.

**Alternatives considered**:
- Generating a PDF with two copies per page via ReportLab: adds backend round-trip for what is a UI concern
- jsPDF multi-copy: works but adds a JS dependency just for this

---

## 8. TDS Rate Source

**Decision**: Configurable per-client value stored on `client` or `Contract` model; not hardcoded

**Rationale**: Different clients may have different TDS rates (typically 2% for freight under section 194C). Storing it on `client.tds_rate` (or `Contract.tds_rate`) allows Accounts to enter it once and have it auto-populate when adding a bill.

**Fields needed**: `tds_rate NUMERIC(5,2)` on `client` or `Contract` (TBD — if contract-level rates differ by period, put on Contract; otherwise client is simpler).

---

## Open Items (carry to data-model.md)

| Item | Resolution Needed |
|------|--------------------|
| TDS rate location | client-level vs Contract-level (needs client confirmation; default: client) |
| HSN code override | Always `996791`? Or can it differ per invoice? (default: always 996791) |
| Bill PDF storage | Store on filesystem or return as stream? (default: stream, do not persist PDF) |
| ReportLab font | Use default Helvetica or embed custom? (default: Helvetica; embed later if needed) |
