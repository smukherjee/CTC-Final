"""add unique constraint on city code and populate missing values

Revision ID: 20260307_01
Revises: 20260305_11
Create Date: 2026-03-07 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

revision = "20260307_01"
down_revision = "20260305_11"
branch_labels = None
depends_on = None


def _random_code(length: int = 5) -> str:
    import random, string
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(random.choices(alphabet, k=length))


def upgrade():
    # populate null/empty codes with generated unique values before enforcing
    # uniqueness. this is a simple loop that keeps trying until a conflict-free
    # code is found; given the small number of cities this runs quickly.
    conn = op.get_bind()
    # first, ensure every existing row has a non-null, non-empty code
    rows = conn.execute(text("SELECT id, code FROM cities")).fetchall()
    for r in rows:
        if not r.code:
            # generate until unique
            code = _random_code()
            while conn.execute(
                text("SELECT 1 FROM cities WHERE code=:code"), {"code": code}
            ).fetchone():
                code = _random_code()
            conn.execute(
                text("UPDATE cities SET code=:code WHERE id=:id"),
                {"code": code, "id": r.id},
            )
    # finally, add unique index on code column
    inspector = sa.inspect(conn)
    indexes = {idx["name"] for idx in inspector.get_indexes("cities")}
    if "ix_cities_code" not in indexes:
        op.create_index("ix_cities_code", "cities", ["code"], unique=True)


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    indexes = {idx["name"] for idx in inspector.get_indexes("cities")}
    if "ix_cities_code" in indexes:
        op.drop_index("ix_cities_code", table_name="cities")
