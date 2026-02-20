import MasterCrudGrid from '@/components/grid/MasterCrudGrid';

interface User {
  id?: number;
  name: string;
  role: string;
  branch_id?: string;
}

export default function UserMaster() {
  return (
    <MasterCrudGrid<User>
      title="User Master"
      endpoint="/api/user/"
      createDraft={() => ({
        name: 'New User',
        role: 'OPERATIONS',
        branch_id: '',
      })}
      toCreatePayload={(row) => ({
        name: row.name,
        role: row.role,
        branch_id: row.branch_id || null,
      })}
      toUpdatePayload={(row) => ({
        name: row.name,
        role: row.role,
        branch_id: row.branch_id || null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'name', headerName: 'NAME', width: 220, editable: true },
        {
          field: 'role',
          headerName: 'ROLE',
          width: 160,
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: { values: ['ADMIN', 'OPERATIONS', 'ACCOUNTS', 'TRACKING'] },
        },
        { field: 'branch_id', headerName: 'BRANCH', width: 180, editable: true },
      ]}
    />
  );
}
