# Main entry point for FastAPI backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# allow all origins for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "CTC-ERP Backend is running"}

# Mount API routers (use service-backed routers in app/api)
from .api.party import router as party_router
from .api.vendor import router as vendor_router


app.include_router(party_router, prefix="/api")
app.include_router(vendor_router, prefix="/api")
