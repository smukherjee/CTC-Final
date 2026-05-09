import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppAgGrid from '@/components/grid/AppAgGrid';
import { formatDisplayDateTime } from '@/utils/dateFormat';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';

interface TrackingFeedRow {
  lr_id?: number;
  lr_number?: string;
  vehicle_number?: string;
  location?: string;
  status?: string;
  reported_at?: string | null;
}

const STATUS_OPTIONS = [
  'IN_TRANSIT',
  'LOADING',
  'UNLOADING',
  'ARRIVED_ORIGIN',
  'ARRIVED_DESTINATION',
  'DETAINED',
  'BREAKDOWN',
];

interface TrackingLogProps {
  initialLrId?: number;
  lockLrId?: boolean;
  embedded?: boolean;
  onSaved?: () => void;
}

export default function TrackingLog({ initialLrId, lockLrId = false, embedded = false, onSaved }: TrackingLogProps) {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState(currentFy);
  const [lrId, setLrId] = useState(initialLrId ? String(initialLrId) : '');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('IN_TRANSIT');
  const [timestamp, setTimestamp] = useState('');
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<TrackingFeedRow[]>([]);
  const [loading, setLoading] = useState(false);

  const resolveLrId = useCallback(async (input: string): Promise<number | null> => {
    const raw = input.trim();
    if (!raw) return null;
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
    try {
      const res = await axios.get(`/api/lr/by-number/${encodeURIComponent(raw)}`);
      const id = Number(res.data?.id);
      return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (initialLrId && Number.isFinite(initialLrId) && initialLrId > 0) {
      setLrId(String(initialLrId));
    }
  }, [initialLrId]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const selectedLrId = Number(lrId);
      const res = await axios.get('/api/vehicle-locations/', {
        params: {
          fy,
          lr_id: Number.isFinite(selectedLrId) && selectedLrId > 0 ? selectedLrId : undefined,
        },
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load tracking feed', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fy, lrId]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const colDefs = useMemo<any[]>(() => [
    {
      field: 'lr_number',
      headerName: 'LR',
      minWidth: 140,
      flex: 1,
      editable: false,
      valueGetter: (params: any) => params.data.lr_number || '-',
    },
    {
      field: 'vehicle_number',
      headerName: 'Vehicle',
      minWidth: 150,
      flex: 1,
      editable: false,
      valueGetter: (params: any) => params.data.vehicle_number || '-',
    },
    {
      field: 'location',
      headerName: 'Location',
      minWidth: 180,
      flex: 1.2,
      editable: false,
      valueGetter: (params: any) => params.data.location || '-',
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 170,
      flex: 1,
      editable: false,
      valueGetter: (params: any) => params.data.status || '-',
    },
    {
      field: 'reported_at',
      headerName: 'Reported At',
      minWidth: 190,
      flex: 1,
      editable: false,
      valueFormatter: (params: any) => formatDisplayDateTime(params.value),
    },
  ], []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedLrId = await resolveLrId(lrId);
    if (!parsedLrId || !location.trim()) {
      alert('Please enter valid LR No and location');
      return;
    }

    setSaving(true);
    try {
      await axios.post('/api/vehicle-locations/', {
        lr_id: parsedLrId,
        location: location.trim(),
        status,
        timestamp: timestamp || undefined,
      });
      setLocation('');
      setTimestamp('');
      await loadFeed();
      onSaved?.();
    } catch (err: any) {
      alert(`Failed to save tracking log: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {!embedded && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tracking Log</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="tracking_fy" className="text-sm font-medium text-slate-700">FY</label>
            <select
              id="tracking_fy"
              value={fy}
              onChange={(e) => setFy(e.target.value)}
              className="rounded border px-3 py-2 text-sm bg-white"
            >
              {fyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 rounded border bg-white p-4 md:grid-cols-5">
        <input
          value={lrId}
          onChange={(e) => setLrId(e.target.value)}
          placeholder="LR No (or ID)"
          disabled={lockLrId}
          className="rounded border px-3 py-2"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="rounded border px-3 py-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Tracking status"
          className="rounded border px-3 py-2"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          aria-label="Reported timestamp"
          className="rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : '+ Log'}
        </button>
      </form>

      <AppAgGrid<TrackingFeedRow>
        rowData={rows}
        columnDefs={colDefs}
        loading={loading}
        noRowsMessage={`No tracking entries found for FY ${fy}.`}
        defaultColDef={{ editable: false }}
        getRowId={(params: any) => String(params.data.reported_at || `${params.data.lr_id || 'row'}-${params.data.location || ''}-${params.rowIndex}`)}
        rowSelection={{ mode: 'singleRow', enableClickSelection: false, checkboxes: false }}
        fitColumns={false}
        alwaysShowHorizontalScroll={true}
      />
    </div>
  );
}
