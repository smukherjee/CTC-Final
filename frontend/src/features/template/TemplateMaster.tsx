import MasterCrudGrid from '@/components/grid/MasterCrudGrid';

interface Template {
  id?: number;
  name: string;
  description?: string;
  file_url?: string;
}

export default function TemplateMaster() {
  return (
    <MasterCrudGrid<Template>
      title="Document Template Master"
      endpoint="/api/template/"
      createDraft={() => ({
        name: 'New Template',
        description: '',
        file_url: '',
      })}
      toCreatePayload={(row) => ({
        name: row.name,
        description: row.description || null,
        file_url: row.file_url || null,
      })}
      toUpdatePayload={(row) => ({
        name: row.name,
        description: row.description || null,
        file_url: row.file_url || null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'name', headerName: 'NAME', width: 220, editable: true },
        { field: 'description', headerName: 'DESCRIPTION', width: 280, editable: true },
        { field: 'file_url', headerName: 'FILE URL', width: 320, editable: true },
      ]}
    />
  );
}
