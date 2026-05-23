# Dependencies and Assumptions

## Dependencies
- Tally accounting system (for sync and master data alignment)
- Indian GST law (E-way Bill, invoice, and compliance logic)
- Legacy data from previous registers and documents
- PostgreSQL database
- Alembic for DB migrations
- React + Vite + CSS for frontend
- FastAPI (Python) for backend
- Docker for local/dev orchestration

## Assumptions
- All users have unique logins and roles assigned
- All master data (Customer, Vendor, Vehicle, etc.) is migrated or entered before operations
- Tally sync is periodic and not real-time
- E-way Bill logic is based on current Indian law as of 2026
- Audit logs are required for 7 years
- File uploads are virus-scanned and validated
- Parallel run with legacy system is temporary (for UAT)
