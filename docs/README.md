# Documentation Index

This directory contains user/admin guides, transition runbooks, and deployment support notes.

## Key Documents

- `implementation_plan.md`: rollout approach and transition flow
- `parallel-run.md`: go-live smoke checklist for dual-run period
- `user-manual.md`: end-user operations for core workflows

## Rollback and Contingency

If production behavior is unstable during rollout:

1. Freeze new financial transactions in CTC-ERP (announce temporary hold).
2. Keep operations running in legacy/manual books only.
3. Capture failing requests from backend logs and note impacted modules.
4. Roll back the latest backend/frontend release artifact.
5. If schema regression is confirmed, restore DB from pre-release backup.
6. Re-run smoke checks from `parallel-run.md` before re-enabling users.

Contingency principles:

- Never delete finance transactions during incident response.
- Prefer corrective entries over destructive data edits.
- Preserve audit trail notes for every manual intervention.
