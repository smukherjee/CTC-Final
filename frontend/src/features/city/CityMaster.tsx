import MasterCrudGrid from '@/components/grid/MasterCrudGrid';

interface City {
  id?: number;
  name: string;
  state?: string;
  code?: string;
}

export default function CityMaster() {
  return (
    <MasterCrudGrid<City>
      title="City Master"
      endpoint="/api/city/"
      createDraft={() => ({
        name: 'New City',
        state: '',
        code: '',
      })}
      toCreatePayload={(row) => ({
        name: row.name,
        state: row.state || null,
        code: row.code || null,
      })}
      toUpdatePayload={(row) => ({
        name: row.name,
        state: row.state || null,
        code: row.code || null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'name', headerName: 'NAME', width: 220, editable: true },
        { field: 'state', headerName: 'STATE', width: 180, editable: true },
        { field: 'code', headerName: 'CODE', width: 120, editable: true },
      ]}
    />
  );
}
