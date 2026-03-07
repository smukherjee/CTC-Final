import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
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
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tracking Log</h2>
          <p className="text-sm text-slate-500">Submit daily LR location/status updates and review latest feed.</p>
        </div>
      )}

      {!embedded && (
        <div className="flex items-center gap-2">
          <label htmlFor="tracking_fy" className="text-sm font-medium text-slate-700">FY</label>
          <select
            id="tracking_fy"
            value={fy}
            onChange={(e) => setFy(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            {fyOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
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
          {saving ? 'Saving...' : 'Add Log'}
        </button>
      </form>

      <div className="overflow-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left">LR</th>
              <th className="px-3 py-2 text-left">Vehicle</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Reported At</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-slate-500">
                  Loading feed...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-slate-500">
                  No tracking entries found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row, idx) => (
                <tr key={`${row.lr_id || 0}-${row.reported_at || idx}`} className="border-t border-slate-100">
                  <td className="px-3 py-2">{row.lr_number || '-'}</td>
                  <td className="px-3 py-2">{row.vehicle_number || '-'}</td>
                  <td className="px-3 py-2">{row.location || '-'}</td>
                  <td className="px-3 py-2">{row.status || '-'}</td>
                  <td className="px-3 py-2">{row.reported_at ? new Date(row.reported_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
