import MasterCrudGrid from '@/components/grid/MasterCrudGrid';
import { formatDisplayDate } from '@/utils/dateFormat';

interface Contract {
  id?: number;
  name: string;
  client_id?: number | null;
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
        client_id: null,
        start_date: null,
        end_date: null,
        expiry_alert_days: null,
        notes: '',
      })}
      toCreatePayload={(row) => ({
        name: row.name,
        client_id: row.client_id ? Number(row.client_id) : null,
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        expiry_alert_days: row.expiry_alert_days ? Number(row.expiry_alert_days) : null,
        notes: row.notes || null,
      })}
      toUpdatePayload={(row) => ({
        name: row.name,
        client_id: row.client_id ? Number(row.client_id) : null,
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        expiry_alert_days: row.expiry_alert_days ? Number(row.expiry_alert_days) : null,
        notes: row.notes || null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'name', headerName: 'NAME', width: 220, editable: true },
        {
          field: 'client_id',
          headerName: 'CLIENT ID',
          width: 120,
          editable: true,
          cellDataType: 'number',
          valueParser: (params: any) => (params.newValue ? Number(params.newValue) : null),
        },
        {
          field: 'start_date',
          headerName: 'START DATE',
          width: 130,
          editable: true,
          cellEditor: 'agDateStringCellEditor',
          valueFormatter: (params: any) => formatDisplayDate(params.value, ''),
        },
        {
          field: 'end_date',
          headerName: 'END DATE',
          width: 130,
          editable: true,
          cellEditor: 'agDateStringCellEditor',
          valueFormatter: (params: any) => formatDisplayDate(params.value, ''),
        },
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
