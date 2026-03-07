from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..schemas.client import Client, ClientCreate, ClientUpdate
from ..services.client_service import (
    get_all_clients, get_client_by_id, create_client, update_client, delete_client
)

# we support both singular and plural paths for compatibility with frontend
# (the UI was using "/api/clients/" while the router previously defined "/api/client/").
router = APIRouter(tags=["client"])

@router.get("/clients/", response_model=List[Client])
@router.get("/client/", response_model=List[Client])
def list_clients():
    return get_all_clients()

@router.get("/clients/{client_id}", response_model=Client)
@router.get("/client/{client_id}", response_model=Client)
def get_client(client_id: int):
    client = get_client_by_id(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("/clients/", response_model=Client)
@router.post("/client/", response_model=Client)
def create_new_client(client: ClientCreate):
    return create_client(client)

@router.put("/clients/{client_id}", response_model=Client)
@router.put("/client/{client_id}", response_model=Client)
def update_existing_client(client_id: int, client: ClientUpdate):
    return update_client(client_id, client)

@router.delete("/clients/{client_id}")
@router.delete("/client/{client_id}")
def delete_existing_client(client_id: int):
    delete_client(client_id)
    return {"ok": True}
