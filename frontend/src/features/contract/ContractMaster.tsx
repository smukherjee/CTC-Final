import MasterCrudGrid from '@/components/grid/MasterCrudGrid';

interface Contract {
  id?: number;
  name: string;
  party_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  expiry_alert_days?: number | null;
  notes?: string | null;
}

export default function ContractMaster() {
  return (
    <MasterCrudGrid<Contract>
      title="Contract Master"
      endpoint="/api/contract/"
      createDraft={() => ({
        name: 'New Contract',
        party_id: null,
        start_date: null,
        end_date: null,
        expiry_alert_days: null,
        notes: '',
      })}
      toCreatePayload={(row) => ({
        name: row.name,
        party_id: row.party_id ? Number(row.party_id) : null,
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        expiry_alert_days: row.expiry_alert_days ? Number(row.expiry_alert_days) : null,
        notes: row.notes || null,
      })}
      toUpdatePayload={(row) => ({
        name: row.name,
        party_id: row.party_id ? Number(row.party_id) : null,
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        expiry_alert_days: row.expiry_alert_days ? Number(row.expiry_alert_days) : null,
        notes: row.notes || null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'name', headerName: 'NAME', width: 220, editable: true },
        {
          field: 'party_id',
          headerName: 'PARTY ID',
          width: 120,
          editable: true,
          cellDataType: 'number',
          valueParser: (params: any) => (params.newValue ? Number(params.newValue) : null),
        },
        { field: 'start_date', headerName: 'START DATE', width: 130, editable: true, cellEditor: 'agDateStringCellEditor' },
        { field: 'end_date', headerName: 'END DATE', width: 130, editable: true, cellEditor: 'agDateStringCellEditor' },
        {
          field: 'expiry_alert_days',
          headerName: 'EXPIRY ALERT (DAYS)',
          width: 180,
          editable: true,
          cellDataType: 'number',
          valueParser: (params: any) => (params.newValue ? Number(params.newValue) : null),
        },
        { field: 'notes', headerName: 'NOTES', width: 260, editable: true },
      ]}
    />
  );
}
