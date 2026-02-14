# Implementation Plan: CTC-ERP Core (React + FastAPI + PostgreSQL)

## 1. Project Setup
- Frontend: Initialize React project (Vite + TypeScript + Tailwind CSS)
- Backend: Initialize Python FastAPI project (with Poetry or pipenv)
- Set up PostgreSQL database
- Configure Alembic for DB migrations
- Set up folder structure for features, components, types, utils, and assets (frontend & backend)
- Configure ESLint, Prettier, and basic CI

## 2. Data Model & API Contracts
- Define TypeScript interfaces (frontend) and Pydantic models (backend) for all entities (User, Party, Vendor, Vehicle, Contract, LR, HireMemo, Invoice, EWayBill, POD, PettyCash, etc.)
- Create OpenAPI schema via FastAPI
- Document API endpoints and contracts

## 3. Master Data Management
- Build Master Data screens (React):
  - Customer/Consignor/Consignee Master
  - Vendor/Supplier/Broker/Driver Master
  - Vehicle Master
  - Contract Master (with expiry alert config)
  - User Management
  - Document Template Master
- Implement Tally lock visualization and field-level permissions
- Backend CRUD endpoints for all masters

## 4. Core Operations
- Dispatch Register (Smart Grid):
  - LR creation, editing, and linking to Hire Memo
  - File upload for LR, Invoice, E-way Bill (optional)
- Hire Memo:
  - Create, link to LR, manage advances/payments
  - Driver details capture
- Trip/Tracking:
  - Daily status log, E-way Bill expiry alerts (configurable)
- POD Management:
  - Upload, flag, verify POD
- Invoice & Annexure:
  - Batch LR selection, annexure generation, variable charges
- Voucher & Ledger:
  - Debit voucher generation, Petty Cash/Bank Book views
- Implement all business logic in FastAPI services

## 5. Reporting & Audit
- Pending billing report (API + UI)
- Audit trail view (Admin only)
- Contract expiry dashboard/alerts

## 6. Security & Access Control
- JWT-based authentication (FastAPI)
- Role-based routing and UI controls (React)
- Field-level permissions (view/edit restrictions)

## 7. Testing & Validation
- Unit and integration tests for all components and services (pytest, React Testing Library)
- End-to-end test scenarios (5-10 full cycles)
- Data migration/import scripts using manual register mapping

## 8. Documentation & Training
- User manual and admin guide
- Field mapping documentation
- API and data model docs (Swagger/OpenAPI)

## 9. Deployment
- Web/Desktop build pipeline
- Backend deployment (Docker, Gunicorn/Uvicorn)
- Initial manual parallel run support

---

**Milestones:**
1. Project scaffolding and master data CRUD (2 weeks)
2. Core operations (Dispatch, Hire Memo, Tracking, POD) (3 weeks)
3. Billing, vouchers, reporting, and audit (2 weeks)
4. Security, testing, and documentation (2 weeks)
5. UAT, deployment, and parallel run (1 week)

**Total Estimate:** 10 weeks (adjust as per team size and velocity)
