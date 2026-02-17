"""Seed cities master table with relevant origin/destination cities.
Run inside backend container or via venv Python.
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from db.db import SessionLocal
from app.models.city import CityModel, create_tables

CITIES = [
    ("SRICITY", "Andhra Pradesh", "SRI"),
    ("CHENNAI", "Tamil Nadu", "CHE"),
    ("BANGALORE", "Karnataka", "BLR"),
    ("HYDERABAD", "Telangana", "HYD"),
    ("MUMBAI", "Maharashtra", "BOM"),
    ("DELHI", "Delhi", "DEL"),
    ("PUNE", "Maharashtra", "PNQ"),
    ("BHIWANDI", "Maharashtra", "BHI"),
    ("KANNUR", "Kerala", "KNN"),
]


def upsert_city(session, name, state=None, code=None):
    existing = session.query(CityModel).filter(CityModel.name == name).first()
    if existing:
        return existing.id
    c = CityModel(name=name, state=state, code=code)
    session.add(c)
    session.flush()
    return c.id


def main():
    # ensure table exists
    create_tables()
    session = SessionLocal()
    try:
        for name, state, code in CITIES:
            upsert_city(session, name, state, code)
        session.commit()
        print("Cities seeded.")
    except Exception as e:
        session.rollback()
        print("Error seeding cities:", e)
    finally:
        session.close()


if __name__ == "__main__":
    main()
