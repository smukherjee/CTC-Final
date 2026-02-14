# Permissions Matrix

| Role         | DR/LR/HireMemo | Invoice | Contract | User Mgmt | Vehicle | Vendor | Doc Template | Reports | Audit Logs |
|--------------|----------------|---------|----------|-----------|---------|--------|--------------|---------|------------|
| Admin        | Full           | Full    | Full     | Full      | Full    | Full   | Full         | Full    | Full       |
| Dispatcher   | Create/Edit    | View    | View     | None      | View    | View   | None         | View    | None       |
| Accounts     | View           | Full    | View     | None      | View    | View   | None         | Full    | View       |
| Tracking     | View           | View    | View     | None      | View    | View   | None         | View    | None       |
| Vendor       | None           | None    | None     | None      | None    | Self   | None         | None    | None       |
| Customer     | None           | None    | None     | None      | None    | None   | None         | None    | None       |

- **Full:** Create, Edit, Delete, View
- **Self:** Can view/edit own record only
- **None:** No access
- **DR:** Dispatch Register
- **LR:** Lorry Receipt
