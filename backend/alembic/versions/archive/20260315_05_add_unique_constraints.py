"""add unique constraints to vehicles and cities

vehicles.number should be unique (vehicle registration plates are unique).
cities (name, state) should be unique to prevent duplicate city entries.

Revision ID: 20260315_05
Revises: 20260315_04
Create Date: 2026-03-15
"""
from alembic import op
import sqlalchemy as sa

revision = "20260315_05"
down_revision = "20260315_04"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = set(inspector.get_table_names())

    if "vehicles" in existing_tables:
        existing_uq = {u["name"] for u in inspector.get_unique_constraints("vehicles")}
        # Also check indexes
        existing_ix = {i["name"] for i in inspector.get_indexes("vehicles")}
        if "uq_vehicles_number" not in existing_uq and "uq_vehicles_number" not in existing_ix:
            # Deduplicate first: keep the row with the lowest id for each duplicate number
            op.execute("""
                DELETE FROM vehicles v1
                USING vehicles v2
                WHERE v1.number = v2.number AND v1.id > v2.id
            """)
            op.create_unique_constraint("uq_vehicles_number", "vehicles", ["number"])

    if "cities" in existing_tables:
        existing_uq = {u["name"] for u in inspector.get_unique_constraints("cities")}
        if "uq_cities_name_state" not in existing_uq:
            # Deduplicate: keep lowest id for each (name, state) pair
            op.execute("""
                DELETE FROM cities c1
                USING cities c2
                WHERE c1.name = c2.name
                  AND (c1.state = c2.state OR (c1.state IS NULL AND c2.state IS NULL))
                  AND c1.id > c2.id
            """)
            op.create_unique_constraint("uq_cities_name_state", "cities", ["name", "state"])


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = set(inspector.get_table_names())

    if "vehicles" in existing_tables:
        uqs = {u["name"] for u in inspector.get_unique_constraints("vehicles")}
        if "uq_vehicles_number" in uqs:
            op.drop_constraint("uq_vehicles_number", "vehicles", type_="unique")

    if "cities" in existing_tables:
        uqs = {u["name"] for u in inspector.get_unique_constraints("cities")}
        if "uq_cities_name_state" in uqs:
            op.drop_constraint("uq_cities_name_state", "cities", type_="unique")
