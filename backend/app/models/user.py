from sqlalchemy import Column, Integer, String
from ..db import engine, Base


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    role = Column(String(64), nullable=False)
    branch_id = Column(String(64), nullable=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
