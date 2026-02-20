import { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

import { useApiList } from '@/hooks/useApiList';
import AppAgGrid from '@/components/grid/AppAgGrid';

type RowId = number | string;

interface MasterCrudGridProps<T extends { id?: RowId }> {
  title: string;
  subtitle?: string;
  endpoint: string;
  columns: any[];
  createDraft: () => Omit<T, 'id'>;
  toCreatePayload: (row: Omit<T, 'id'>) => Record<string, unknown>;
  toUpdatePayload: (row: T) => Record<string, unknown>;
  mapItem?: (item: any) => T;
}

function withSlash(endpoint: string): string {
  return endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
}

export default function MasterCrudGrid<T extends { id?: RowId }>({
  title,
  subtitle,
  endpoint,
  columns,
  createDraft,
  toCreatePayload,
  toUpdatePayload,
  mapItem,
}: MasterCrudGridProps<T>) {
  const listEndpoint = withSlash(endpoint);
  const { data, setData, loading, error, refetch } = useApiList<T>({ endpoint: listEndpoint, mapItem });
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  const setSaving = useCallback((id: RowId, isSaving: boolean) => {
    setSavingIds((prev) => ({ ...prev, [String(id)]: isSaving }));
  }, []);

  const onAdd = useCallback(async () => {
    const draft = createDraft();
    const payload = toCreatePayload(draft);
    const res = await axios.post(listEndpoint, payload);
    const created = mapItem ? mapItem(res.data) : (res.data as T);
    setData((prev) => [created, ...prev]);
  }, [createDraft, listEndpoint, mapItem, setData, toCreatePayload]);

  const onDelete = useCallback(async (row: T) => {
    const id = row.id;
    if (id === undefined || id === null) return;
    await axios.delete(`${listEndpoint}${id}`);
    setData((prev) => prev.filter((it) => String(it.id) !== String(id)));
  }, [listEndpoint, setData]);

  const onCellValueChanged = useCallback(async (event: any) => {
    const row = event.data as T;
    const id = row.id;
    if (id === undefined || id === null) return;
    setSaving(id, true);
    try {
      const payload = toUpdatePayload(row);
      const res = await axios.put(`${listEndpoint}${id}`, payload);
      const updated = mapItem ? mapItem(res.data) : (res.data as T);
      setData((prev) => prev.map((it) => (String(it.id) === String(id) ? updated : it)));
    } finally {
      setSaving(id, false);
    }
  }, [listEndpoint, mapItem, setData, setSaving, toUpdatePayload]);

  const colDefs = useMemo(() => {
    return [
      ...columns,
      {
        headerName: 'ACT',
        width: 80,
        pinned: 'right',
        sortable: false,
        filter: false,
        editable: false,
        cellRenderer: (params: any) => {
          const row = params.data as T;
          const isSaving = row?.id !== undefined ? savingIds[String(row.id)] : false;
          return (
            <div className="flex items-center justify-center h-full gap-1">
              <button
                onClick={() => onDelete(row)}
                className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                title="Delete"
                disabled={isSaving}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        },
      },
    ];
  }, [columns, onDelete, savingIds]);

  if (error) {
    console.error(`Failed to load ${title}:`, error);
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{subtitle || `Manage ${title.toLowerCase()} centrally`} • {data.length} records</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => onAdd()}
            className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New
          </button>
        </div>
      </div>

      <AppAgGrid<T>
        rowData={data}
        columnDefs={colDefs}
        loading={loading}
        onCellValueChanged={onCellValueChanged}
        getRowId={(params: any) => String(params.data.id)}
      />
    </div>
  );
}
