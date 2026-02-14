# Requirements Quality Checklist: CTC-ERP Core

**Purpose:** Validate the completeness, clarity, and quality of requirements for the CTC-ERP core domain before implementation.
**Created:** 2026-02-14


## Requirement Completeness
- [ ] CHK001 Are all master entities (Customer, Vendor, Vehicle, Contract, User, Document Template) explicitly defined and mapped? [Completeness, Spec §Functional Requirements]
- [ ] CHK002 Are all operational flows (Dispatch, Hire Memo, Tracking, POD, Billing, Voucher) covered with clear requirements? [Completeness, Spec §Functional Requirements]
- [X] CHK003 Are all fields from legacy registers and sample documents mapped to the data model? [Completeness, manual-register-mapping.md]
- [ ] CHK004 Are reporting and audit requirements (pending billing, audit trail) specified? [Completeness, Spec §Reporting]


## Requirement Clarity
- [X] CHK005 Are field definitions and data types unambiguous for all entities? [Clarity, Spec §Data Model]
- [ ] CHK006 Is the timing and method of contract expiry alerts clearly specified and configurable? [Clarity, Spec §Master Data Management]
- [ ] CHK007 Are file upload requirements (optional/mandatory, types) clearly stated? [Clarity, Spec §Functional Requirements]
- [ ] CHK008 Are E-way Bill alert requirements aligned with Indian law and clearly described? [Clarity, Spec §Master Data Management]

## Requirement Consistency
- [ ] CHK009 Are field names and meanings consistent across all masters, forms, and reports? [Consistency, manual-register-mapping.md]
- [ ] CHK010 Are permissions and access controls consistent for all roles and screens? [Consistency, Spec §Security]

## Acceptance Criteria Quality
 [X] CHK012 Are end-to-end test scenarios (5-10 cycles) required and described? [Acceptance Criteria, test-scenarios.md]

## Scenario & Edge Case Coverage
 [X] CHK013 Are exception flows (e.g., contract expiry, failed uploads, audit log errors) addressed? [Coverage, exception-flows.md]
 [X] CHK014 Are all document/field mapping edge cases (e.g., derived fields, optional fields) covered? [Edge Case, manual-register-mapping.md]

## Non-Functional Requirements
- [ ] CHK015 Are audit trail, data retention, and Tally sync requirements specified? [Non-Functional, Spec §Security]
- [ ] CHK016 Are deployment, parallel run, and compliance requirements included? [Non-Functional, Spec §Deployment]
- [ ] CHK018 Is the frontend stack React + Vite + CSS, and backend PostgreSQL, explicitly required and documented? [Non-Functional, Spec §Plan/Assumptions]
- [ ] CHK019 Is Alembic specified and used for PostgreSQL database versioning/migrations? [Non-Functional, Spec §Plan/Assumptions]

## Dependencies & Assumptions
 [X] CHK017 Are all dependencies (Tally, Indian law, legacy data) and assumptions documented? [Dependencies, dependencies-and-assumptions.md]

---

**Checklist created for: specs/001-core-erp/**
