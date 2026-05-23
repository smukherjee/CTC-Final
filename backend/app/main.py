# Main entry point for FastAPI backend
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
_allowed_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]
_allowed_origin_regex = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$|^https://ctc-final-.*\.vercel\.app$",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=_allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register error handlers
from app.core.errors import register_exception_handlers
register_exception_handlers(app)


@app.get("/")
def read_root():
    return {"message": "CTC-ERP Backend is running"}

# Mount API routers (use service-backed routers in app/api)
from app.api.client import router as client_router
from app.api.vendor import router as vendor_router
from app.api.vehicle import router as vehicle_router
from app.api.contract import router as contract_router
from app.api.user import router as user_router
from app.api.template import router as template_router
from app.api.city import router as city_router
from app.api.hirememo import router as hirememo_router
from app.api.lr import router as lr_router
from app.api.vehicle_location import router as vehicle_location_router
from app.api.config import router as config_router
from app.api.files import router as files_router
from app.api.ewaybill import router as ewaybill_router
from app.api.billing import router as billing_router
from app.api.payment_receipts import router as payment_receipts_router
from app.api.vouchers import router as vouchers_router
from app.api.reports import router as reports_router


app.include_router(client_router, prefix="/api")
app.include_router(vendor_router, prefix="/api")
app.include_router(vehicle_router, prefix="/api")
app.include_router(contract_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(template_router, prefix="/api")
app.include_router(city_router, prefix="/api")
app.include_router(hirememo_router, prefix="/api")
app.include_router(lr_router, prefix="/api")
app.include_router(vehicle_location_router, prefix="/api")
app.include_router(config_router, prefix="/api")
app.include_router(files_router, prefix="/api")
app.include_router(ewaybill_router, prefix="/api")
app.include_router(billing_router, prefix="/api")
app.include_router(payment_receipts_router, prefix="/api")
app.include_router(vouchers_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
