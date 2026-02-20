import MasterCrudGrid from '@/components/grid/MasterCrudGrid';

interface Vehicle {
  id?: number;
  number: string;
  type?: string;
  capacity?: string;
  owner_id?: number | null;
  status?: string;
}

export default function VehicleMaster() {
  return (
    <MasterCrudGrid<Vehicle>
      title="Vehicle Master"
      endpoint="/api/vehicle/"
      createDraft={() => ({
        number: 'NEW-VEHICLE',
        type: '',
        capacity: '',
        owner_id: null,
        status: 'AVAILABLE',
      })}
      toCreatePayload={(row) => ({
        number: row.number,
        type: row.type || null,
        capacity: row.capacity || null,
        owner_id: row.owner_id ? Number(row.owner_id) : null,
        status: row.status || null,
      })}
      toUpdatePayload={(row) => ({
        number: row.number,
        type: row.type || null,
        capacity: row.capacity || null,
        owner_id: row.owner_id ? Number(row.owner_id) : null,
        status: row.status || null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'number', headerName: 'NUMBER', width: 180, editable: true },
        { field: 'type', headerName: 'TYPE', width: 170, editable: true },
        { field: 'capacity', headerName: 'CAPACITY', width: 140, editable: true },
        {
          field: 'owner_id',
          headerName: 'OWNER ID',
          width: 120,
          editable: true,
          cellDataType: 'number',
          valueParser: (params: any) => (params.newValue ? Number(params.newValue) : null),
        },
        {
          field: 'status',
          headerName: 'STATUS',
          width: 140,
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: { values: ['AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE'] },
        },
      ]}
    />
  );
}
