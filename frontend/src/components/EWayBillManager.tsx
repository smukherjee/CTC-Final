import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface EWayBillRecord {
  id: number;
  lr_id: number;
  number: string;
  valid_from?: string;
  valid_upto?: string;
  expires_at?: string;
  status?: string;
  is_expired?: boolean;
  extension_count?: number;
  last_extended_at?: string;
  file_url?: string;
}

interface EWayBillManagerProps {
  lrId?: number;
}

const EMPTY_NEW_BILL = {
  number: '',
  valid_from: '',
  valid_upto: '',
};

export default function EWayBillManager({ lrId }: EWayBillManagerProps) {
  const [rows, setRows] = useState<EWayBillRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newBill, setNewBill] = useState(EMPTY_NEW_BILL);
  const [extendDates, setExtendDates] = useState<Record<number, string>>({});
  const [newBillPdf, setNewBillPdf] = useState<File | null>(null);

  const canManage = Boolean(lrId && lrId > 0);

  const loadRows = useCallback(async () => {
    if (!canManage) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('/api/ewaybill/', { params: { lr_id: lrId } });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load e-way bills', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [canManage, lrId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const activeCount = useMemo(() => rows.filter((r) => !r.is_expired).length, [rows]);

  const createBill = async () => {
    if (!canManage) return;
    if (!newBill.number.trim() || !newBill.valid_upto) {
      alert('E-way Bill number and validity date are required.');
      return;
    }
    if (newBillPdf) {
      const isPdf = (newBillPdf.type || '').toLowerCase() === 'application/pdf' || newBillPdf.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        alert('E-way Bill upload must be PDF.');
        return;
      }
      if (newBillPdf.size > 1024 * 1024) {
        alert('E-way Bill PDF must be less than 1 MB.');
        return;
      }
    }

    setSaving(true);
    try {
      const createRes = await axios.post('/api/ewaybill/', {
        lr_id: lrId,
        number: newBill.number.trim(),
        valid_from: newBill.valid_from || null,
        valid_upto: newBill.valid_upto,
      });

      const createdId = Number(createRes.data?.id);
      if (newBillPdf && Number.isFinite(createdId) && createdId > 0) {
        try {
          const formData = new FormData();
          formData.append('document_type', 'EWAY_BILL');
          formData.append('lr_id', String(lrId));
          formData.append('file', newBillPdf);
          const fileRes = await axios.post('/api/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          await axios.put(`/api/ewaybill/${createdId}`, {
            file_url: fileRes.data?.file_url || null,
          });
        } catch (uploadErr: any) {
          alert(`E-way Bill created, but PDF upload failed: ${uploadErr?.response?.data?.detail || uploadErr?.message || 'Unknown error'}`);
        }
      }

      setNewBill(EMPTY_NEW_BILL);
      setNewBillPdf(null);
      await loadRows();
    } catch (err: any) {
      alert(`Failed to create E-way Bill: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const extendBill = async (ewayId: number) => {
    const date = extendDates[ewayId];
    if (!date) {
      alert('Choose a new validity date to extend.');
      return;
    }
    setSaving(true);
    try {
      await axios.put(`/api/ewaybill/${ewayId}/extend`, { valid_upto: date });
      setExtendDates((prev) => ({ ...prev, [ewayId]: '' }));
      await loadRows();
    } catch (err: any) {
      alert(`Failed to extend E-way Bill: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteBill = async (ewayId: number) => {
    if (!confirm('Delete this E-way Bill record?')) return;
    try {
      await axios.delete(`/api/ewaybill/${ewayId}`);
      await loadRows();
    } catch (err: any) {
      alert(`Failed to delete E-way Bill: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">E-Way Bills</h4>
        <div className="text-xs text-slate-500">
          Active: <span className="font-semibold">{activeCount}</span> / Total: <span className="font-semibold">{rows.length}</span>
        </div>
      </div>

      {!canManage && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Save LR first to add/manage multiple E-way Bills.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-slate-50 border border-slate-200 rounded-md p-3">
        <input
          value={newBill.number}
          onChange={(e) => setNewBill((prev) => ({ ...prev, number: e.target.value }))}
          placeholder="E-way Bill Number"
          className="border border-slate-200 rounded px-2 py-1.5 text-sm"
          disabled={!canManage || saving}
        />
        <input
          type="date"
          value={newBill.valid_from}
          onChange={(e) => setNewBill((prev) => ({ ...prev, valid_from: e.target.value }))}
          className="border border-slate-200 rounded px-2 py-1.5 text-sm"
          disabled={!canManage || saving}
        />
        <input
          type="date"
          value={newBill.valid_upto}
          onChange={(e) => setNewBill((prev) => ({ ...prev, valid_upto: e.target.value }))}
          className="border border-slate-200 rounded px-2 py-1.5 text-sm"
          disabled={!canManage || saving}
        />
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => setNewBillPdf(e.target.files?.[0] || null)}
          className="border border-slate-200 rounded px-2 py-1.5 text-sm bg-white"
          disabled={!canManage || saving}
        />
        <button
          type="button"
          onClick={createBill}
          disabled={!canManage || saving}
          className="rounded bg-slate-900 text-white text-sm px-3 py-1.5 disabled:opacity-60"
        >
          Add E-Way Bill
        </button>
        <div className="text-xs text-slate-500 md:col-span-5">E-Way Bill upload: PDF only, max 1 MB.</div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">Number</th>
              <th className="text-left px-3 py-2">Valid From</th>
              <th className="text-left px-3 py-2">Valid Upto</th>
              <th className="text-left px-3 py-2">Expires At (Midnight)</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">PDF</th>
              <th className="text-left px-3 py-2">Extend</th>
              <th className="text-left px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={8}>Loading E-way Bills...</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={8}>No E-way Bills linked to this LR.</td>
              </tr>
            )}
            {!loading && rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{row.number}</td>
                <td className="px-3 py-2">{row.valid_from || '-'}</td>
                <td className="px-3 py-2">{row.valid_upto || '-'}</td>
                <td className="px-3 py-2">{row.expires_at ? new Date(row.expires_at).toLocaleString() : '-'}</td>
                <td className="px-3 py-2">
                  <span className={row.is_expired ? 'text-red-700 font-medium' : 'text-emerald-700 font-medium'}>
                    {row.status || (row.is_expired ? 'EXPIRED' : 'ACTIVE')}
                  </span>
                  {row.extension_count ? (
                    <span className="text-xs text-slate-500 ml-2">Ext: {row.extension_count}</span>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  {row.file_url ? (
                    <a href={row.file_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline text-xs">
                      View PDF
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">-</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={extendDates[row.id] || ''}
                      onChange={(e) => setExtendDates((prev) => ({ ...prev, [row.id]: e.target.value }))}
                      className="border border-slate-200 rounded px-2 py-1 text-xs"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => extendBill(row.id)}
                      className="text-blue-700 hover:text-blue-800 text-xs"
                      disabled={saving}
                    >
                      Extend
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => deleteBill(row.id)}
                    className="text-red-600 hover:text-red-700 text-xs"
                    disabled={saving}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
