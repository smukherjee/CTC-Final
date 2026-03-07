"""Comprehensive sample-data seed for CTC ERP.

Purpose:
- Read the bill notebook sample workbook referenced by docs/rectcsampledata notebook.
- Seed 15 deterministic LR-led scenarios that cover register/report conditions.
- Populate dependent records for screens that otherwise appear empty.

Run (inside backend container):
    python /app/app/scripts/seed_comprehensive_sample_data.py
"""

from __future__ import annotations

import hashlib
import os
import re
import sys
import zipfile
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from typing import Dict, List, Optional
from xml.etree import ElementTree as ET

from sqlalchemy import inspect

# Ensure project root is importable when run as a standalone script.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.db import SessionLocal  # noqa: E402
from app.core.financial_year_utils import fy_from_date  # noqa: E402
from app.models.city import CityModel  # noqa: E402
from app.models.contract import ContractModel  # noqa: E402
from app.models.ewaybill import EWayBillModel  # noqa: E402
from app.models.file_upload import FileUploadModel  # noqa: E402
from app.models.hirememo import HireMemoModel  # noqa: E402
from app.models.invoice import InvoiceLineModel, InvoiceModel  # noqa: E402
from app.models.lr import LRModel  # noqa: E402
from app.models.client import ClientModel  # noqa: E402
from app.models.payment_receipt import PaymentReceiptModel  # noqa: E402
from app.models.vehicle import VehicleModel  # noqa: E402
from app.models.vehicle_location import VehicleLocationModel  # noqa: E402
from app.models.vendor import VendorModel  # noqa: E402
from app.models.voucher import VoucherModel  # noqa: E402
from app.services.voucher_service import sync_hirememo_advance_vouchers  # noqa: E402


SEED_TAG = "[SEED15]"
BASE_TIME = datetime(2026, 3, 1, 10, 0, tzinfo=timezone.utc)
REPO_ROOT = Path(__file__).resolve().parents[3]
WORKBOOK_CANDIDATES = [
    REPO_ROOT / "docs" / "rectcsampledata" / "CTC BILL NOTEBOOK Sample.xlsx",
    Path("/workspace/docs/rectcsampledata/CTC BILL NOTEBOOK Sample.xlsx"),
    Path("/app/docs/rectcsampledata/CTC BILL NOTEBOOK Sample.xlsx"),
]
POD_STORAGE_ROOT = REPO_ROOT / "backend" / "app" / "storage" / "uploads" / "seed"

NS_MAIN = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"
OFFICE_REL_ID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"


@dataclass
class Scenario:
    idx: int
    name: str
    lr_date: date
    lr_status: str
    pod_state: str  # none | uploaded | verified
    invoice_status: Optional[str]
    create_hirememo: bool
    hirememo_ack: str
    eway_state: str  # active | expired | expiring
    tracking_state: str
    fy_target: str


SCENARIOS: List[Scenario] = [
    Scenario(1, "paid_billed_verified", date(2025, 4, 20), "BILLED", "verified", "paid", True, "CLOSED", "active", "DELIVERED", "2025-26"),
    Scenario(2, "partial_collection", date(2025, 5, 10), "BILLED", "verified", "partially_paid", True, "RECEIVED", "active", "AT_HUB", "2025-26"),
    Scenario(3, "pending_billing_report", date(2025, 5, 1), "POD_VERIFIED", "verified", None, True, "PENDING", "expiring", "IN_TRANSIT", "2025-26"),
    Scenario(4, "pod_uploaded_invoice_draft", date(2025, 6, 14), "POD_UPLOADED", "uploaded", "draft", True, "PENDING", "active", "UNLOADING", "2025-26"),
    Scenario(5, "dispatch_unbilled_expired_eway", date(2025, 7, 1), "DISPATCHED", "none", None, False, "PENDING", "expired", "LOADING", "2025-26"),
    Scenario(6, "dispatch_unbilled_active", date(2025, 8, 15), "DISPATCHED", "none", None, True, "PENDING", "active", "IN_TRANSIT", "2025-26"),
    Scenario(7, "invoice_overdue", date(2025, 9, 9), "BILLED", "verified", "overdue", True, "RECEIVED", "expiring", "AT_DESTINATION", "2025-26"),
    Scenario(8, "cancelled_trip", date(2025, 10, 3), "CANCELLED", "none", None, False, "PENDING", "active", "CANCELLED", "2025-26"),
    Scenario(9, "submitted_invoice", date(2025, 11, 18), "DELIVERED", "uploaded", "submitted", True, "CLOSED", "active", "DELIVERED", "2025-26"),
    Scenario(10, "prior_fy_paid", date(2024, 4, 12), "BILLED", "verified", "paid", True, "CLOSED", "active", "DELIVERED", "2024-25"),
    Scenario(11, "prior_fy_partial", date(2024, 7, 22), "BILLED", "verified", "partially_paid", True, "RECEIVED", "expired", "AT_HUB", "2024-25"),
    Scenario(12, "prior_fy_unpaid", date(2024, 12, 30), "BILLED", "verified", "unpaid", True, "PENDING", "expired", "IN_TRANSIT", "2024-25"),
    Scenario(13, "older_fy_paid", date(2023, 8, 10), "BILLED", "verified", "paid", True, "CLOSED", "expired", "DELIVERED", "2023-24"),
    Scenario(14, "oldest_fy_unpaid", date(2022, 11, 19), "BILLED", "verified", "unpaid", True, "PENDING", "expired", "AT_DESTINATION", "2022-23"),
    Scenario(15, "recent_fy_mix", date(2026, 2, 20), "POD_UPLOADED", "uploaded", "partially_paid", True, "RECEIVED", "expiring", "IN_TRANSIT", "2025-26"),
]


ROUTES = [
    ("Sricity", "Chennai", "Andhra Pradesh", "Tamil Nadu"),
    ("Chennai", "Hyderabad", "Tamil Nadu", "Telangana"),
    ("Bengaluru", "Pune", "Karnataka", "Maharashtra"),
    ("Mumbai", "Ahmedabad", "Maharashtra", "Gujarat"),
    ("Delhi", "Jaipur", "Delhi", "Rajasthan"),
    ("Kolkata", "Bhubaneswar", "West Bengal", "Odisha"),
    ("Kochi", "Coimbatore", "Kerala", "Tamil Nadu"),
    ("Lucknow", "Kanpur", "Uttar Pradesh", "Uttar Pradesh"),
    ("Indore", "Bhopal", "Madhya Pradesh", "Madhya Pradesh"),
    ("Patna", "Ranchi", "Bihar", "Jharkhand"),
    ("Guwahati", "Shillong", "Assam", "Meghalaya"),
    ("Chandigarh", "Ludhiana", "Punjab", "Punjab"),
    ("Nagpur", "Raipur", "Maharashtra", "Chhattisgarh"),
    ("Surat", "Vadodara", "Gujarat", "Gujarat"),
    ("Visakhapatnam", "Vijayawada", "Andhra Pradesh", "Andhra Pradesh"),
]

VEHICLE_NUMBERS = [
    "AP39TA1001",
    "TN01AB2002",
    "KA05CD3003",
    "MH12EF4004",
    "GJ01GH5005",
    "DL01JK6006",
    "WB20LM7007",
    "UP32NP8008",
    "MP09QR9009",
    "BR01ST1010",
    "AS01UV1111",
    "PB10WX1212",
    "OD02YZ1313",
    "RJ14AA1414",
    "KL07BB1515",
]


def _parse_date(value: Optional[str]) -> Optional[date]:
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.upper() == "VARIOUS":
        return None
    for fmt in ("%d.%m.%Y", "%d-%m-%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def _parse_decimal(value: Optional[str], default: Decimal = Decimal("0")) -> Decimal:
    if value is None:
        return default
    text = str(value).strip().replace(",", "")
    if not text:
        return default
    try:
        return Decimal(text)
    except Exception:
        return default


def _cell_row_values(row_el, shared_strings: List[str]) -> List[Optional[str]]:
    values: Dict[int, Optional[str]] = {}
    max_col = 0
    for c in row_el.findall("m:c", NS_MAIN):
        ref = c.attrib.get("r", "")
        col_letters = re.sub(r"[^A-Z]", "", ref)
        if not col_letters:
            continue
        col_idx = 0
        for ch in col_letters:
            col_idx = col_idx * 26 + (ord(ch) - ord("A") + 1)
        t = c.attrib.get("t")
        raw = c.find("m:v", NS_MAIN)
        if raw is None:
            inline = c.find("m:is", NS_MAIN)
            if inline is not None:
                t_node = inline.find(".//m:t", NS_MAIN)
                val = t_node.text if t_node is not None else None
            else:
                val = None
        else:
            txt = raw.text
            if t == "s" and txt is not None and txt.isdigit():
                idx = int(txt)
                val = shared_strings[idx] if idx < len(shared_strings) else txt
            else:
                val = txt
        values[col_idx] = val
        max_col = max(max_col, col_idx)
    return [values.get(i) for i in range(1, max_col + 1)]


def _read_workbook_rows(path: Path) -> Dict[str, List[List[Optional[str]]]]:
    with zipfile.ZipFile(path) as zf:
        wb = ET.fromstring(zf.read("xl/workbook.xml"))
        rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
        rel_map = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in rels.findall(f"{REL_NS}Relationship")
        }

        shared_strings: List[str] = []
        if "xl/sharedStrings.xml" in zf.namelist():
            sst = ET.fromstring(zf.read("xl/sharedStrings.xml"))
            for si in sst.findall("m:si", NS_MAIN):
                texts = [t.text or "" for t in si.findall(".//m:t", NS_MAIN)]
                shared_strings.append("".join(texts))

        result: Dict[str, List[List[Optional[str]]]] = {}
        for sh in wb.findall("m:sheets/m:sheet", NS_MAIN):
            name = sh.attrib["name"]
            rel_id = sh.attrib[OFFICE_REL_ID]
            target = rel_map[rel_id]
            xml_name = "xl/" + target.replace("\\", "/")
            sheet = ET.fromstring(zf.read(xml_name))
            rows = []
            for row_el in sheet.findall("m:sheetData/m:row", NS_MAIN):
                rows.append(_cell_row_values(row_el, shared_strings))
            result[name] = rows
        return result


def _extract_bill_rows(raw_sheets: Dict[str, List[List[Optional[str]]]]) -> List[dict]:
    rows: List[dict] = []

    # Sheet1: main row starts after decorative headings.
    for r in raw_sheets.get("Sheet1", []):
        if len(r) < 8:
            continue
        if not (r[0] and str(r[0]).strip().isdigit()):
            continue
        rows.append(
            {
                "bill_no": str(r[0]).strip(),
                "bill_date": _parse_date(r[1]),
                "lr_no": str(r[2]).strip() if r[2] else "",
                "lr_date": _parse_date(r[3]),
                "origin": (r[4] or "").strip() if r[4] else "",
                "destination": (r[5] or "").strip() if r[5] else "",
                "customer": (r[6] or "").strip() if r[6] else "",
                "amount": _parse_decimal(r[7], Decimal("0")),
                "amount_passed": _parse_decimal(r[8], Decimal("0")) if len(r) > 8 else Decimal("0"),
                "deductions": (r[9] or "NIL").strip() if len(r) > 9 and r[9] else "NIL",
                "cm_no": (r[10] or "").strip() if len(r) > 10 and r[10] else "",
                "cm_date": _parse_date(r[11]) if len(r) > 11 else None,
            }
        )

    # Sheet2: simple rows, ignore footer total row.
    for r in raw_sheets.get("Sheet2", []):
        if len(r) < 8:
            continue
        if not (r[0] and str(r[0]).strip().isdigit()):
            continue
        rows.append(
            {
                "bill_no": str(r[0]).strip(),
                "bill_date": _parse_date(r[1]),
                "lr_no": str(r[2]).strip() if r[2] else "",
                "lr_date": _parse_date(r[3]),
                "origin": (r[4] or "").strip() if r[4] else "",
                "destination": (r[5] or "").strip() if r[5] else "",
                "customer": (r[6] or "").strip() if r[6] else "",
                "amount": _parse_decimal(r[7], Decimal("0")),
                "amount_passed": Decimal("0"),
                "deductions": "NIL",
                "cm_no": "",
                "cm_date": None,
            }
        )

    # Sheet3: fuller bill notebook rows.
    for r in raw_sheets.get("Sheet3", []):
        if len(r) < 8:
            continue
        if not (r[0] and str(r[0]).strip().isdigit()):
            continue
        rows.append(
            {
                "bill_no": str(r[0]).strip(),
                "bill_date": _parse_date(r[1]),
                "lr_no": str(r[2]).strip() if r[2] else "",
                "lr_date": _parse_date(r[3]),
                "origin": (r[4] or "").strip() if r[4] else "",
                "destination": (r[5] or "").strip() if r[5] else "",
                "customer": (r[6] or "").strip() if r[6] else "",
                "amount": _parse_decimal(r[7], Decimal("0")),
                "amount_passed": _parse_decimal(r[8], Decimal("0")) if len(r) > 8 else Decimal("0"),
                "deductions": (r[9] or "NIL").strip() if len(r) > 9 and r[9] else "NIL",
                "cm_no": (r[10] or "").strip() if len(r) > 10 and r[10] else "",
                "cm_date": _parse_date(r[11]) if len(r) > 11 else None,
            }
        )
    return rows


def _extract_receipt_rows(raw_sheets: Dict[str, List[List[Optional[str]]]]) -> List[dict]:
    rows: List[dict] = []
    for i, r in enumerate(raw_sheets.get("Sheet4", [])):
        if i == 0:
            continue
        if len(r) < 3:
            continue
        payment_date = _parse_date(r[0])
        if not payment_date:
            continue
        rows.append(
            {
                "payment_date": payment_date,
                "amount": _parse_decimal(r[1], Decimal("0")),
                "received_from": (r[2] or "UNKNOWN").strip(),
            }
        )
    return rows


def _table_exists(session, table_name: str) -> bool:
    return inspect(session.bind).has_table(table_name)


def _resolve_workbook_path() -> Optional[Path]:
    env_override = os.getenv("SEED_WORKBOOK_PATH")
    if env_override:
        p = Path(env_override)
        if p.exists():
            return p
    for candidate in WORKBOOK_CANDIDATES:
        if candidate.exists():
            return candidate
    return None


def _ensure_pdf(path: Path) -> tuple[int, str]:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        pdf_bytes = (
            b"%PDF-1.4\n"
            b"1 0 obj<<>>endobj\n"
            b"2 0 obj<< /Type /Catalog /Pages 3 0 R >>endobj\n"
            b"3 0 obj<< /Type /Pages /Kids [4 0 R] /Count 1 >>endobj\n"
            b"4 0 obj<< /Type /Page /Parent 3 0 R /MediaBox [0 0 200 200] /Contents 5 0 R >>endobj\n"
            b"5 0 obj<< /Length 44 >>stream\nBT /F1 12 Tf 30 100 Td (Seed POD Document) Tj ET\nendstream endobj\n"
            b"xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000031 00000 n \n"
            b"0000000080 00000 n \n0000000137 00000 n \n0000000227 00000 n \n"
            b"trailer<< /Root 2 0 R /Size 6 >>\nstartxref\n329\n%%EOF\n"
        )
        path.write_bytes(pdf_bytes)
    data = path.read_bytes()
    return len(data), hashlib.sha256(data).hexdigest()


def _upsert_client(session, name: str, p_type: str = "customer") -> ClientModel:
    row = session.query(ClientModel).filter(ClientModel.name == name).first()
    if row:
        if row.type != p_type:
            row.type = p_type
        return row
    row = ClientModel(name=name, type=p_type, tds_rate=Decimal("2.00"))
    session.add(row)
    session.flush()
    return row


def _upsert_vendor(session, name: str) -> VendorModel:
    row = session.query(VendorModel).filter(VendorModel.name == name).first()
    if row:
        return row
    row = VendorModel(name=name, type="fleet_owner", mobile="9000000000", pan=f"PAN{name[:5].upper():0<5}")
    session.add(row)
    session.flush()
    return row


def _upsert_vehicle(session, number: str, vehicle_type: str, owner_id: int) -> VehicleModel:
    row = session.query(VehicleModel).filter(VehicleModel.number == number).first()
    if row:
        row.type = vehicle_type
        row.owner_id = owner_id
        row.status = "active"
        return row
    row = VehicleModel(number=number, type=vehicle_type, owner_id=owner_id, status="active", capacity="16T")
    session.add(row)
    session.flush()
    return row


def _upsert_city(session, name: str, state: str) -> CityModel:
    row = session.query(CityModel).filter(CityModel.name == name).first()
    if row:
        row.state = state
        return row
    row = CityModel(name=name, state=state, code=name[:3].upper())
    session.add(row)
    session.flush()
    return row


def _upsert_contract(session, name: str, client_id: int, start_date: date, end_date: date, notes: str) -> ContractModel:
    row = session.query(ContractModel).filter(ContractModel.name == name).first()
    if row:
        row.client_id = client_id
        row.start_date = start_date
        row.end_date = end_date
        row.expiry_alert_days = 30
        row.notes = notes
        return row
    row = ContractModel(
        name=name,
        client_id=client_id,
        start_date=start_date,
        end_date=end_date,
        expiry_alert_days=30,
        notes=notes,
    )
    session.add(row)
    session.flush()
    return row


def _upsert_lr(session, payload: dict) -> LRModel:
    row = session.query(LRModel).filter(LRModel.lr_number == payload["lr_number"]).first()
    if row:
        for key, val in payload.items():
            setattr(row, key, val)
        return row
    row = LRModel(**payload)
    session.add(row)
    session.flush()
    return row


def _upsert_hirememo(
    session,
    lr: LRModel,
    scenario: Scenario,
    total_amount: Decimal,
    vehicle_id: Optional[int],
    vehicle_number: str,
) -> Optional[HireMemoModel]:
    if not scenario.create_hirememo:
        return None

    advance_cash = (total_amount * Decimal("0.20")).quantize(Decimal("0.01"))
    advance_bank = (total_amount * Decimal("0.15")).quantize(Decimal("0.01"))
    if scenario.hirememo_ack == "PENDING":
        advance_bank = Decimal("0.00")
    if scenario.hirememo_ack == "CLOSED":
        advance_cash = (total_amount * Decimal("0.30")).quantize(Decimal("0.01"))
        advance_bank = (total_amount * Decimal("0.25")).quantize(Decimal("0.01"))

    hm = session.query(HireMemoModel).filter(HireMemoModel.lr_id == lr.id).first()
    if not hm:
        hm = HireMemoModel(lr_id=lr.id)
        session.add(hm)
        session.flush()

    hm.hire_memo_no = f"HM-SEED-{scenario.idx:03d}"
    hm.hire_memo_date = scenario.lr_date + timedelta(days=1)
    hm.branch = "HQ"
    hm.vehicle_id = vehicle_id
    hm.vehicle_number = vehicle_number
    hm.from_location = lr.origin
    hm.to_location = lr.destination
    hm.payment_location = lr.destination
    hm.rate_type = "FIXED"
    hm.freight_rate = total_amount
    hm.freight_weight = Decimal("10.00")
    hm.guaranteed_weight = Decimal("10.00")
    hm.total_amount = total_amount
    hm.advance_cash = advance_cash
    hm.advance_bank = advance_bank
    hm.balance = (total_amount - advance_cash - advance_bank).quantize(Decimal("0.01"))
    hm.commission = (total_amount * Decimal("0.02")).quantize(Decimal("0.01"))
    hm.hamali = Decimal("250.00")
    hm.mamul = Decimal("100.00")
    hm.other_deductions = Decimal("50.00")
    hm.ack_status = scenario.hirememo_ack
    hm.notes = f"{SEED_TAG} HireMemo for scenario={scenario.name}"
    hm.driver_name = lr.driver_name
    hm.driver_mobile = lr.driver_mobile
    hm.driver_license = f"DL{scenario.idx:06d}"
    hm.financial_year = fy_from_date(hm.hire_memo_date)

    session.flush()
    sync_hirememo_advance_vouchers(
        session,
        hirememo_id=hm.id,
        hirememo_no=hm.hire_memo_no,
        hirememo_date=hm.hire_memo_date,
        advance_cash=float(hm.advance_cash or 0),
        advance_bank=float(hm.advance_bank or 0),
    )
    return hm


def _upsert_invoice(session, lr: LRModel, client_id: int, scenario: Scenario, amount: Decimal) -> Optional[InvoiceModel]:
    if not scenario.invoice_status:
        # Keep this LR unbilled where required (used by pending billing report).
        return None

    invoice_no = f"SEED-INV-{scenario.idx:03d}"
    invoice_date = scenario.lr_date + timedelta(days=10)
    total_amount = amount.quantize(Decimal("0.01"))
    tds_amount = (total_amount * Decimal("0.02")).quantize(Decimal("0.01"))
    net_amount = (total_amount - tds_amount).quantize(Decimal("0.01"))

    inv = session.query(InvoiceModel).filter(InvoiceModel.invoice_no == invoice_no).first()
    if not inv:
        inv = InvoiceModel(invoice_no=invoice_no, invoice_date=invoice_date, client_id=client_id)
        session.add(inv)
        session.flush()

    inv.invoice_date = invoice_date
    inv.client_id = client_id
    inv.financial_year = fy_from_date(invoice_date)
    inv.po_no = f"PO-{scenario.idx:03d}"
    inv.po_date = scenario.lr_date
    inv.hsn_code = "996791"
    inv.reverse_charge = False
    inv.gst_paid_by = "consignor"
    inv.total_amount = total_amount
    inv.tds_amount = tds_amount
    inv.net_amount = net_amount
    inv.status = scenario.invoice_status

    line = session.query(InvoiceLineModel).filter(InvoiceLineModel.invoice_id == inv.id, InvoiceLineModel.lr_id == lr.id).first()
    if not line:
        line = InvoiceLineModel(invoice_id=inv.id, lr_id=lr.id)
        session.add(line)

    line.s_no = 1
    line.lr_no = lr.lr_number
    line.lr_date = lr.date
    line.qty = Decimal("1.00")
    line.particulars = f"{SEED_TAG} Freight - {lr.origin} to {lr.destination}"
    line.v_type = lr.vehicle_type
    line.vehicle_no = lr.vehicle_number
    line.consignor = lr.consignor_name
    line.consignee = lr.consignee_name
    line.from_city = lr.origin
    line.to_city = lr.destination
    line.freight = total_amount
    line.loading_detention = Decimal("0.00")
    line.unloading_charges = Decimal("0.00")
    line.unloading_detention = Decimal("0.00")
    line.other_charges = Decimal("0.00")
    line.total = total_amount
    return inv


def _upsert_receipt(session, payment_date: date, amount: Decimal, received_from: str, notes: str) -> PaymentReceiptModel:
    row = session.query(PaymentReceiptModel).filter(PaymentReceiptModel.notes == notes).first()
    if row:
        row.payment_date = payment_date
        row.amount = amount
        row.received_from = received_from
        row.financial_year = fy_from_date(payment_date)
        return row
    row = PaymentReceiptModel(
        payment_date=payment_date,
        amount=amount,
        received_from=received_from,
        financial_year=fy_from_date(payment_date),
        notes=notes,
    )
    session.add(row)
    session.flush()
    return row


def _upsert_voucher_for_receipt(session, receipt: PaymentReceiptModel):
    row = (
        session.query(VoucherModel)
        .filter(
            VoucherModel.reference_type == "PAYMENT_RECEIPT",
            VoucherModel.reference_id == receipt.id,
        )
        .first()
    )
    narration = f"{SEED_TAG} Receipt from {receipt.received_from}"
    if row:
        row.voucher_type = "bank_credit"
        row.amount = receipt.amount
        row.date = receipt.payment_date
        row.financial_year = receipt.financial_year
        row.narration = narration
        return
    session.add(
        VoucherModel(
            voucher_type="bank_credit",
            reference_type="PAYMENT_RECEIPT",
            reference_id=receipt.id,
            amount=receipt.amount,
            date=receipt.payment_date,
            financial_year=receipt.financial_year,
            narration=narration,
        )
    )


def _upsert_eway_bill(session, lr: LRModel, scenario: Scenario):
    valid_from = lr.date or scenario.lr_date
    if scenario.eway_state == "expired":
        valid_upto = valid_from - timedelta(days=2)
    elif scenario.eway_state == "expiring":
        valid_upto = date(2026, 3, 6)
    else:
        valid_upto = valid_from + timedelta(days=10)
    expires_at = datetime.combine(valid_upto + timedelta(days=1), time.min, tzinfo=timezone.utc)
    status = "EXPIRED" if expires_at <= datetime.now(timezone.utc) else "ACTIVE"

    row = session.query(EWayBillModel).filter(EWayBillModel.lr_id == lr.id).first()
    if not row:
        row = EWayBillModel(lr_id=lr.id, number=f"EWBSEED{scenario.idx:05d}")
        session.add(row)

    row.number = f"EWBSEED{scenario.idx:05d}"
    row.valid_from = valid_from
    row.valid_upto = valid_upto
    row.expires_at = expires_at
    row.status = status
    row.alert_sent = scenario.eway_state in {"expired", "expiring"}
    row.file_url = f"/api/files/{lr.id}/content"
    row.extension_count = 1 if scenario.eway_state == "expiring" else 0
    row.meta = {"seed": True, "scenario": scenario.name}

    lr.eway_bill_no = row.number
    lr.eway_bill_expiry = expires_at
    lr.eway_bill = {
        "number": row.number,
        "valid_upto": valid_upto.isoformat(),
        "status": status,
    }


def _upsert_vehicle_location(session, lr: LRModel, scenario: Scenario):
    checkpoints = [
        (lr.origin, "LOADING", 0),
        (f"Midway-{scenario.idx}", "IN_TRANSIT", 1),
        (lr.destination, scenario.tracking_state, 2),
    ]
    for location, status, hop in checkpoints:
        reported_at = BASE_TIME + timedelta(hours=scenario.idx * 5 + hop)
        row = (
            session.query(VehicleLocationModel)
            .filter(
                VehicleLocationModel.lr_id == lr.id,
                VehicleLocationModel.location == location,
                VehicleLocationModel.reported_at == reported_at,
            )
            .first()
        )
        if row:
            row.status = status
            row.vehicle_number = lr.vehicle_number or f"SEED-{scenario.idx:03d}"
            row.notes = f"{SEED_TAG} hop={hop}"
            row.reported_by = "seed-script"
            continue

        session.add(
            VehicleLocationModel(
                lr_id=lr.id,
                vehicle_number=lr.vehicle_number or f"SEED-{scenario.idx:03d}",
                location=location,
                status=status,
                reported_by="seed-script",
                reported_at=reported_at,
                notes=f"{SEED_TAG} hop={hop}",
            )
        )


def _upsert_pod_file(session, lr: LRModel, scenario: Scenario):
    if scenario.pod_state == "none":
        lr.pod_url = None
        lr.pod_file_id = None
        lr.pod_received = False
        lr.pod_verified_at = None
        return

    pdf_path = POD_STORAGE_ROOT / f"{lr.lr_number}.pdf"
    file_size, checksum = _ensure_pdf(pdf_path)
    filename = f"{lr.lr_number}.pdf"

    row = (
        session.query(FileUploadModel)
        .filter(
            FileUploadModel.document_type == "POD",
            FileUploadModel.lr_id == lr.id,
            FileUploadModel.original_filename == filename,
        )
        .first()
    )
    if not row:
        row = FileUploadModel(
            document_type="POD",
            lr_id=lr.id,
            hirememo_id=None,
            original_filename=filename,
            stored_filename=filename,
            storage_path=str(pdf_path),
            file_url="",
            content_type="application/pdf",
            file_size=file_size,
            checksum=checksum,
            uploaded_by="seed-script",
            expires_at=datetime.now(timezone.utc) + timedelta(days=365),
            is_archived=False,
        )
        session.add(row)
        session.flush()

    row.storage_path = str(pdf_path)
    row.content_type = "application/pdf"
    row.file_size = file_size
    row.checksum = checksum
    row.file_url = f"/api/files/{row.id}/content"
    row.uploaded_by = "seed-script"
    row.is_archived = False

    lr.pod_url = row.file_url
    lr.pod_file_id = row.id
    lr.pod_received = True
    if scenario.pod_state == "verified":
        lr.pod_verified_at = datetime.now(timezone.utc) - timedelta(days=1)
        if lr.status == "POD_UPLOADED":
            lr.status = "POD_VERIFIED"
    else:
        lr.pod_verified_at = None


def _normalize_lr_no(value: str, fallback_idx: int) -> str:
    if not value:
        return f"SAMPLE-{fallback_idx:03d}"
    token = value.split("-")[0].strip()
    token = token.replace("/", "").replace(" ", "")
    if token.upper() == "VARIOUS" or not token:
        return f"SAMPLE-{fallback_idx:03d}"
    return token


def _seed(session):
    workbook_path = _resolve_workbook_path()
    if workbook_path:
        raw = _read_workbook_rows(workbook_path)
        bill_rows = _extract_bill_rows(raw)
        receipt_rows = _extract_receipt_rows(raw)
    else:
        # Container fallback when docs folder is not mounted.
        bill_rows = [
            {"bill_no": "78", "bill_date": date(2025, 4, 28), "lr_no": "VARIOUS", "lr_date": None, "origin": "SRICITY", "destination": "VARIOUS", "customer": "HAVELLS INDIA LTD, SRICITY", "amount": Decimal("207500"), "amount_passed": Decimal("207500"), "deductions": "NIL", "cm_no": "9583", "cm_date": date(2025, 6, 30)},
            {"bill_no": "669", "bill_date": date(2025, 7, 24), "lr_no": "47378", "lr_date": date(2025, 7, 16), "origin": "CHENNAI", "destination": "HYDERABAD", "customer": "SURYA ELECTRICALS, CHENNAI", "amount": Decimal("24000"), "amount_passed": Decimal("0"), "deductions": "NIL", "cm_no": "", "cm_date": None},
            {"bill_no": "822", "bill_date": date(2025, 8, 26), "lr_no": "47871", "lr_date": date(2025, 8, 1), "origin": "CHENNAI", "destination": "VIJAYWADA", "customer": "SURYA ELECTRICALS, CHENNAI", "amount": Decimal("32000"), "amount_passed": Decimal("0"), "deductions": "NIL", "cm_no": "", "cm_date": None},
            {"bill_no": "92", "bill_date": date(2025, 4, 30), "lr_no": "45668", "lr_date": date(2025, 4, 20), "origin": "SRICITY", "destination": "THANJAVUR", "customer": "FLYJAC LOGISTICS P LTD, CHENNAI", "amount": Decimal("38720"), "amount_passed": Decimal("38720"), "deductions": "NIL", "cm_no": "9592", "cm_date": date(2025, 7, 10)},
            {"bill_no": "124", "bill_date": date(2025, 5, 7), "lr_no": "45674", "lr_date": date(2025, 4, 27), "origin": "SRICITY", "destination": "THANJAVUR", "customer": "FLYJAC LOGISTICS P LTD, CHENNAI", "amount": Decimal("33000"), "amount_passed": Decimal("14500"), "deductions": "NIL", "cm_no": "9592", "cm_date": date(2025, 7, 10)},
            {"bill_no": "365", "bill_date": date(2025, 6, 14), "lr_no": "46245", "lr_date": date(2025, 5, 30), "origin": "SRICITY", "destination": "THANJAVUR", "customer": "FLYJAC LOGISTICS P LTD, CHENNAI", "amount": Decimal("33000"), "amount_passed": Decimal("0"), "deductions": "NIL", "cm_no": "", "cm_date": None},
        ]
        receipt_rows = [
            {"payment_date": date(2025, 11, 27), "amount": Decimal("591897"), "received_from": "FLIPKART INDIA P LTD"},
            {"payment_date": date(2025, 12, 16), "amount": Decimal("3202800"), "received_from": "INSTAKART SERVICES P LTD"},
            {"payment_date": date(2025, 12, 16), "amount": Decimal("1862214"), "received_from": "FLIPKART INDIA P LTD"},
        ]
        print("Workbook not mounted in this runtime; using notebook-derived fallback sample rows.")
    if not bill_rows:
        raise RuntimeError("Could not read bill notebook sample rows from workbook")

    table_flags = {
        "clients": _table_exists(session, "clients"),
        "lrs": _table_exists(session, "lrs"),
        "invoices": _table_exists(session, "invoices"),
        "invoice_lines": _table_exists(session, "invoice_lines"),
        "payment_receipts": _table_exists(session, "payment_receipts"),
        "hirememos": _table_exists(session, "hirememos"),
        "vehicles": _table_exists(session, "vehicles"),
        "vendors": _table_exists(session, "vendors"),
        "vouchers": _table_exists(session, "vouchers"),
        "cities": _table_exists(session, "cities"),
        "contracts": _table_exists(session, "contracts"),
        "eway_bills": _table_exists(session, "eway_bills"),
        "file_uploads": _table_exists(session, "file_uploads"),
        "vehicle_locations": _table_exists(session, "vehicle_locations"),
    }
    required = ["clients", "lrs", "invoices", "invoice_lines", "payment_receipts", "hirememos"]
    missing_required = [t for t in required if not table_flags[t]]
    if missing_required:
        raise RuntimeError(f"Required tables missing after migration: {', '.join(missing_required)}")

    has_eway = table_flags["eway_bills"]
    has_files = table_flags["file_uploads"]
    has_tracking = table_flags["vehicle_locations"]
    has_voucher = table_flags["vouchers"]
    has_city = table_flags["cities"]
    has_contract = table_flags["contracts"]
    has_vehicle = table_flags["vehicles"] and table_flags["vendors"]

    if has_city:
        for origin, destination, origin_state, destination_state in ROUTES:
            _upsert_city(session, origin, origin_state)
            _upsert_city(session, destination, destination_state)

    created_lrs: List[LRModel] = []
    invoice_count = 0
    hm_count = 0

    for scenario in SCENARIOS:
        sample = bill_rows[(scenario.idx - 1) % len(bill_rows)]
        route = ROUTES[scenario.idx - 1]
        origin, destination, _, _ = route
        vehicle_number = VEHICLE_NUMBERS[scenario.idx - 1]

        customer_name = sample["customer"] or f"Customer Seed {scenario.idx:02d}"
        consignor_name = f"{customer_name} Dispatch"
        consignee_name = customer_name
        vendor_name = f"Vendor Seed {scenario.idx:02d}"

        customer = _upsert_client(session, customer_name, "customer")
        _upsert_client(session, consignor_name, "consignor")
        _upsert_client(session, consignee_name, "consignee")
        vehicle = None
        if has_vehicle:
            vendor = _upsert_vendor(session, vendor_name)
            vehicle = _upsert_vehicle(session, vehicle_number, "TRUCK", vendor.id)

        lr_number = f"SEEDLR-{scenario.idx:03d}-{_normalize_lr_no(sample.get('lr_no', ''), scenario.idx)}"
        freight = (sample["amount"] if sample["amount"] > 0 else Decimal("25000")) + Decimal(str(scenario.idx * 150))
        bill_date = sample["bill_date"] or (scenario.lr_date + timedelta(days=12))
        fy = fy_from_date(scenario.lr_date)

        lr = _upsert_lr(
            session,
            {
                "lr_number": lr_number,
                "date": scenario.lr_date,
                "consignor_id": str(customer.id),
                "consignor_name": consignor_name,
                "consignee_id": str(customer.id),
                "consignee_name": consignee_name,
                "origin": origin,
                "destination": destination,
                "delivery_at": destination,
                "through": "Road",
                "through_id": None,
                "fob": "PAID",
                "goods_items": [{"item": "Electricals", "qty": 1}],
                "articles_count": 1,
                "articles_description": "Consumer durables",
                "weight": Decimal("1000.00"),
                "freight_amount": freight,
                "status": scenario.lr_status,
                "vehicle_id": vehicle.id if vehicle else None,
                "vehicle_number": vehicle.number if vehicle else vehicle_number,
                "vehicle_type": vehicle.type if vehicle else "TRUCK",
                "seal_number": f"SEAL{scenario.idx:04d}",
                "driver_name": f"Driver {scenario.idx:02d}",
                "driver_mobile": f"9{scenario.idx:09d}"[-10:],
                "booked_on_owners_risk": scenario.idx % 2 == 0,
                "loading_point_times": {
                    "in_date": scenario.lr_date.isoformat(),
                    "in_time": "08:00",
                    "out_date": scenario.lr_date.isoformat(),
                    "out_time": "11:30",
                },
                "value_rs": (freight * Decimal("1.35")).quantize(Decimal("0.01")),
                "surcharge": Decimal("100.00"),
                "hamali_charges": Decimal("75.00"),
                "st_charges": Decimal("25.00"),
                "total": (freight + Decimal("200.00")).quantize(Decimal("0.01")),
                "bill_number": f"SEED-BILL-{scenario.idx:03d}",
                "bill_date": bill_date,
                "amount_passed": sample["amount_passed"] if sample["amount_passed"] > 0 else None,
                "deductions": sample["deductions"] or "NIL",
                "cm_no": sample["cm_no"] or f"CM{scenario.idx:04d}",
                "cm_date": sample["cm_date"] or (bill_date + timedelta(days=10)),
                "remarks": f"{SEED_TAG} {scenario.name}",
                "eway_bill": None,
                "pod_url": None,
                "pod_verified_at": None,
                "pod_received": False,
                "pod_file_id": None,
                "eway_bill_no": None,
                "eway_bill_expiry": None,
                "financial_year": fy,
                "fob_client_id": customer.id,
            },
        )

        if has_files:
            _upsert_pod_file(session, lr, scenario)
        elif scenario.pod_state != "none":
            lr.pod_received = True
            lr.pod_url = f"/api/files/seed/{lr.lr_number}"
            if scenario.pod_state == "verified":
                lr.pod_verified_at = datetime.now(timezone.utc) - timedelta(days=1)

        if has_eway:
            _upsert_eway_bill(session, lr, scenario)

        hm = _upsert_hirememo(
            session,
            lr,
            scenario,
            (freight * Decimal("0.85")).quantize(Decimal("0.01")),
            vehicle.id if vehicle else None,
            vehicle.number if vehicle else vehicle_number,
        )
        if hm:
            hm_count += 1

        inv = _upsert_invoice(session, lr, customer.id, scenario, (freight * Decimal("1.00")).quantize(Decimal("0.01")))
        if inv:
            invoice_count += 1

        if has_tracking:
            _upsert_vehicle_location(session, lr, scenario)

        # Contract coverage for contract monitor screen.
        if has_contract:
            _upsert_contract(
                session,
                name=f"SEED-CONTRACT-{scenario.idx:03d}",
                client_id=customer.id,
                start_date=scenario.lr_date - timedelta(days=90),
                end_date=scenario.lr_date + timedelta(days=(15 - scenario.idx)),
                notes=f"{SEED_TAG} Contract for {customer_name}",
            )

        created_lrs.append(lr)

    # Seed standalone payment receipts from sample Sheet4.
    for i, rr in enumerate(receipt_rows, start=1):
        rec = _upsert_receipt(
            session,
            payment_date=rr["payment_date"],
            amount=rr["amount"],
            received_from=rr["received_from"],
            notes=f"{SEED_TAG} SAMPLE-SHEET4-{i}",
        )
        if has_voucher:
            _upsert_voucher_for_receipt(session, rec)

    # Seed invoice-linked receipts for paid/partial scenarios.
    for scenario in SCENARIOS:
        inv = session.query(InvoiceModel).filter(InvoiceModel.invoice_no == f"SEED-INV-{scenario.idx:03d}").first()
        if not inv:
            continue
        if inv.status == "paid":
            amount = Decimal(inv.net_amount or inv.total_amount or 0)
        elif inv.status in {"partially_paid", "submitted"}:
            amount = (Decimal(inv.net_amount or inv.total_amount or 0) * Decimal("0.55")).quantize(Decimal("0.01"))
        else:
            continue

        client = session.query(ClientModel).filter(ClientModel.id == inv.client_id).first()
        rec = _upsert_receipt(
            session,
            payment_date=inv.invoice_date + timedelta(days=20),
            amount=amount,
            received_from=client.name if client else f"Client-{inv.client_id}",
            notes=f"{SEED_TAG} INVOICE-{inv.invoice_no}",
        )
        if has_voucher:
            _upsert_voucher_for_receipt(session, rec)

    # Add one manual cash voucher to ensure cash book has non-hirememo records.
    if has_voucher:
        manual = (
            session.query(VoucherModel)
            .filter(
                VoucherModel.reference_type == "SEED_MANUAL",
                VoucherModel.reference_id == 1,
            )
            .first()
        )
        if not manual:
            session.add(
                VoucherModel(
                    voucher_type="cash_debit",
                    reference_type="SEED_MANUAL",
                    reference_id=1,
                    amount=Decimal("2500.00"),
                    narration=f"{SEED_TAG} petty cash expense",
                    date=date(2025, 6, 1),
                    financial_year="2025-26",
                )
            )
        else:
            manual.amount = Decimal("2500.00")
            manual.date = date(2025, 6, 1)
            manual.financial_year = "2025-26"
            manual.narration = f"{SEED_TAG} petty cash expense"

    session.commit()
    print(
        f"Seed complete: lrs={len(created_lrs)} invoices={invoice_count} "
        f"hirememos={hm_count} receipts={session.query(PaymentReceiptModel).filter(PaymentReceiptModel.notes.ilike(f'{SEED_TAG}%')).count()}"
    )
    print("FY coverage:", ", ".join(sorted({fy_from_date(s.lr_date) for s in SCENARIOS}, reverse=True)))


def main():
    session = SessionLocal()
    try:
        _seed(session)
    except Exception as exc:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
