import MasterCrudGrid from '@/components/grid/MasterCrudGrid';

interface Party {
  id?: number;
  name: string;
  type: 'CUSTOMER' | 'CONSIGNOR' | 'CONSIGNEE' | 'BOTH';
  gstin?: string;
  mobile?: string;
  address?: string;
}

export default function PartyMaster() {
  return (
    <MasterCrudGrid<Party>
      title="Party Master"
      endpoint="/api/party/"
      mapItem={(item: any) => ({ ...item, type: String(item.type || '').toUpperCase() })}
      createDraft={() => ({
        name: 'New Party',
        type: 'CONSIGNOR',
        gstin: '',
        mobile: '',
        address: '',
      })}
      toCreatePayload={(row) => ({
        name: row.name,
        type: row.type,
        gstin: row.gstin || null,
        mobile: row.mobile || null,
        address: row.address || null,
      })}
      toUpdatePayload={(row) => ({
        name: row.name,
        type: row.type,
        gstin: row.gstin || null,
        mobile: row.mobile || null,
        address: row.address || null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'name', headerName: 'NAME', width: 220, editable: true },
        {
          field: 'type',
          headerName: 'TYPE',
          width: 140,
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: { values: ['CUSTOMER', 'CONSIGNOR', 'CONSIGNEE', 'BOTH'] },
          valueParser: (params: any) => String(params.newValue || '').toUpperCase(),
        },
        { field: 'gstin', headerName: 'GSTIN', width: 180, editable: true },
        { field: 'mobile', headerName: 'MOBILE', width: 140, editable: true },
        { field: 'address', headerName: 'ADDRESS', width: 280, editable: true },
      ]}
    />
  );
}
