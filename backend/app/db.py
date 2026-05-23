"""App-level DB helper to expose SQLAlchemy engine and sessions."""
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Example:
# - Local Postgres: postgresql://postgres:<password>@127.0.0.1:5432/postgres
# - Supabase: postgresql://postgres:<password>@<project-ref>.supabase.co:5432/postgres
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:54322/postgres")
DATABASE_URL = "postgresql://postgres.dlwjwyfcyduowqvxcrrr:ctclogi$tics123%24@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

engine = create_engine(DATABASE_URL, echo=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

from typing import Generator


def get_db() -> Generator:
    """FastAPI dependency that yields a DB session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


__all__ = ["engine", "SessionLocal", "Base", "get_db"]
