"""Seed master tables from Dispatch Register mock data.
This script creates parties (consignors/consignees), vehicles and contracts
based on the mock data embedded in the frontend DispatchRegister component.

Run inside the backend container: python /app/app/scripts/seed_dr_masters.py
"""
import os
import sys
# Ensure project root is on path when script executed inside container
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from db.db import SessionLocal
from app.models.party import PartyModel
from app.models.vehicle import VehicleModel
from app.models.contract import ContractModel

# Mock data derived from frontend/src/features/operations/DispatchRegister.tsx
MOCK_LRS = [
    {
        "id": "1",
        "lr_number": "45610",
        "date": "2025-04-01",
        "dispatch_id": "TRIP-25-001",
        "consignor_id": "C001",
        "consignor_name": "HAVELLS INDIA LTD SRICITY",
        "consignee_id": "C002",
        "consignee_name": "USHA ELECTROTRADE",
        "from": "SRICITY",
        "to": "CHENNAI",
        "vehicle_type": "TAURUS ACE",
        "vehicle_number": "MH 43 BX 3816",
    },
    {
        "id": "2",
        "lr_number": "45611",
        "date": "2025-04-01",
        "dispatch_id": "TRIP-25-001",
        "consignor_id": "C003",
        "consignor_name": "SURYA ELECTRICALS CHENNAI",
        "consignee_id": "C004",
        "consignee_name": "METRO DISTRIBUTORS",
        "from": "CHENNAI",
        "to": "BANGALORE",
        "vehicle_type": "TATA ACE",
        "vehicle_number": "TN 01 AB 1234",
    },
    {
        "id": "3",
        "lr_number": "45612",
        "date": "2025-04-02",
        "dispatch_id": "TRIP-25-002",
        "consignor_id": "C005",
        "consignor_name": "FLYJAC LOGISTICS P LTD",
        "consignee_id": "C006",
        "consignee_name": "PRIME AGENCIES PUNE",
        "from": "MUMBAI",
        "to": "PUNE",
        "vehicle_type": "EICHER 14FT",
        "vehicle_number": "MH 02 CD 5678",
    },
]


def upsert_party(session, name, p_type="company"):
    existing = session.query(PartyModel).filter(PartyModel.name == name).first()
    if existing:
        return existing.id
    p = PartyModel(name=name, type=p_type)
    session.add(p)
    session.flush()
    return p.id


def upsert_vehicle(session, number, vtype=None):
    existing = session.query(VehicleModel).filter(VehicleModel.number == number).first()
    if existing:
        return existing.id
    v = VehicleModel(number=number, type=vtype, status="active")
    session.add(v)
    session.flush()
    return v.id


def upsert_contract(session, name, party_id=None):
    existing = session.query(ContractModel).filter(ContractModel.name == name).first()
    if existing:
        return existing.id
    c = ContractModel(name=name, party_id=party_id)
    session.add(c)
    session.flush()
    return c.id


def main():
    session = SessionLocal()
    try:
        # Parties
        parties = {}
        for lr in MOCK_LRS:
            consignor = lr.get("consignor_name")
            consignee = lr.get("consignee_name")
            if consignor and consignor not in parties:
                pid = upsert_party(session, consignor, p_type="consignor")
                parties[consignor] = pid
            if consignee and consignee not in parties:
                cid = upsert_party(session, consignee, p_type="consignee")
                parties[consignee] = cid

        # Vehicles
        vehicles = {}
        for lr in MOCK_LRS:
            num = lr.get("vehicle_number")
            vtype = lr.get("vehicle_type")
            if num and num not in vehicles:
                vid = upsert_vehicle(session, num, vtype)
                vehicles[num] = vid

        # Contracts (use dispatch_id)
        contracts = {}
        for lr in MOCK_LRS:
            disp = lr.get("dispatch_id")
            consignor = lr.get("consignor_name")
            party_id = parties.get(consignor) if consignor else None
            if disp and disp not in contracts:
                cid = upsert_contract(session, disp, party_id=party_id)
                contracts[disp] = cid

        session.commit()
        print("Seeding complete.")
    except Exception as e:
        session.rollback()
        print("Error seeding:", e)
    finally:
        session.close()


if __name__ == "__main__":
    main()
