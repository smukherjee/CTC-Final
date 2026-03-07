"""Seed cities master table with relevant origin/destination cities.
Run inside backend container or via venv Python.
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.db import SessionLocal
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
    """Insert a city if it does not already exist.

    The database now assigns a unique opaque code automatically when a city is
    created via the API. The seeding script, however, continues to pass explicit
    codes for the well‑known cities listed below so that their values remain
    predictable during development. If you prefer to rely on the generator, omit
    the `code` argument and the service will fill it in on next run.
    """
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
