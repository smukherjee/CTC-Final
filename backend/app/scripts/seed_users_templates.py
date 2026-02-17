"""Seed users and templates master tables.
Run inside the backend container:

python /app/app/scripts/seed_users_templates.py
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from db.db import SessionLocal
from app.models.user import UserModel
from app.models.template import TemplateModel

MOCK_USERS = [
    {"name": "Admin User", "role": "admin", "branch_id": "HQ"},
    {"name": "Dispatcher", "role": "dispatcher", "branch_id": "SRICITY"},
    {"name": "Clerk", "role": "clerk", "branch_id": "CHENNAI"},
]

MOCK_TEMPLATES = [
    {"name": "LR Template", "description": "Default lorry receipt template", "file_url": "/templates/lr-template.hbs"},
]


def upsert_user(session, data):
    existing = session.query(UserModel).filter(UserModel.name == data["name"]).first()
    if existing:
        return existing.id
    u = UserModel(name=data["name"], role=data["role"], branch_id=data.get("branch_id"))
    session.add(u)
    session.flush()
    return u.id


def upsert_template(session, data):
    existing = session.query(TemplateModel).filter(TemplateModel.name == data["name"]).first()
    if existing:
        return existing.id
    t = TemplateModel(name=data["name"], description=data.get("description"), file_url=data.get("file_url"))
    session.add(t)
    session.flush()
    return t.id


def main():
    session = SessionLocal()
    try:
        for u in MOCK_USERS:
            upsert_user(session, u)
        for t in MOCK_TEMPLATES:
            upsert_template(session, t)
        session.commit()
        print("Users and templates seeded.")
    except Exception as e:
        session.rollback()
        print("Error seeding users/templates:", e)
    finally:
        session.close()


if __name__ == "__main__":
    main()
