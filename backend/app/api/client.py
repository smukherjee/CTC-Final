from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..schemas.client import Client, ClientCreate, ClientUpdate
from ..services.client_service import (
    get_all_clients, get_client_by_id, create_client, update_client, delete_client
)

router = APIRouter(tags=["client"])

@router.get("/clients/", response_model=List[Client])
def list_clients(db: Session = Depends(get_db)):
    return get_all_clients(db)

@router.get("/clients/{client_id}", response_model=Client)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = get_client_by_id(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("/clients/", response_model=Client)
def create_new_client(client: ClientCreate, db: Session = Depends(get_db)):
    return create_client(db, client)

@router.put("/clients/{client_id}", response_model=Client)
def update_existing_client(client_id: int, client: ClientUpdate, db: Session = Depends(get_db)):
    return update_client(db, client_id, client)

@router.delete("/clients/{client_id}")
def delete_existing_client(client_id: int, db: Session = Depends(get_db)):
    delete_client(db, client_id)
    return {"ok": True}
