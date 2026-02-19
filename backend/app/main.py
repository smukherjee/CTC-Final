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

# register error handlers
from .core.errors import register_exception_handlers
register_exception_handlers(app)


@app.get("/")
def read_root():
    return {"message": "CTC-ERP Backend is running"}

# Mount API routers (use service-backed routers in app/api)
from .api.party import router as party_router
from .api.vendor import router as vendor_router
from .api.vehicle import router as vehicle_router
from .api.contract import router as contract_router
from .api.user import router as user_router
from .api.template import router as template_router
from .api.city import router as city_router
from .api.hirememo import router as hirememo_router
from .api.lr import router as lr_router
from .api.vehicle_location import router as vehicle_location_router


app.include_router(party_router, prefix="/api")
app.include_router(vendor_router, prefix="/api")
app.include_router(vehicle_router, prefix="/api")
app.include_router(contract_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(template_router, prefix="/api")
app.include_router(city_router, prefix="/api")
app.include_router(hirememo_router, prefix="/api")
app.include_router(lr_router, prefix="/api")
app.include_router(vehicle_location_router, prefix="/api")
