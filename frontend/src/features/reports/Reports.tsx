import { useEffect, useState } from 'react';
import axios from 'axios';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';

type ReportTab = 'pending' | 'outstanding';

export default function Reports() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState(currentFy);
  const [tab, setTab] = useState<ReportTab>('pending');
  const [pendingRows, setPendingRows] = useState<any[]>([]);
  const [outstandingRows, setOutstandingRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/reports/pending-billing', { params: { fy } }),
      axios.get('/api/reports/outstanding-receivables', { params: { fy } }),
    ])
      .then(([pendingRes, outstandingRes]) => {
        setPendingRows(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        setOutstandingRows(Array.isArray(outstandingRes.data) ? outstandingRes.data : []);
      })
      .catch((err) => {
        console.error('Failed to load reports', err);
        setPendingRows([]);
        setOutstandingRows([]);
      })
      .finally(() => setLoading(false));
  }, [fy]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500">Pending Billing and Outstanding Receivables</p>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="reports_fy" className="text-sm font-medium text-slate-700">FY</label>
        <select
          id="reports_fy"
          value={fy}
          onChange={(e) => setFy(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          {fyOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => setTab('pending')} className={`rounded px-3 py-1 text-sm ${tab === 'pending' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}>Pending Billing</button>
        <button type="button" onClick={() => setTab('outstanding')} className={`rounded px-3 py-1 text-sm ${tab === 'outstanding' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}>Outstanding Receivables</button>
      </div>

      <div className="overflow-auto rounded border bg-white">
        {loading && <div className="p-4 text-sm text-slate-500">Loading reports...</div>}

        {!loading && tab === 'pending' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left">LR No</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Vehicle</th>
                <th className="px-3 py-2 text-left">Consignor</th>
                <th className="px-3 py-2 text-left">Consignee</th>
                <th className="px-3 py-2 text-left">Route</th>
              </tr>
            </thead>
            <tbody>
              {pendingRows.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-4 text-slate-500">No pending billing rows.</td></tr>
              )}
              {pendingRows.map((row) => (
                <tr key={row.lr_id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{row.lr_number}</td>
                  <td className="px-3 py-2">{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
                  <td className="px-3 py-2">{row.vehicle_number || '-'}</td>
                  <td className="px-3 py-2">{row.consignor_name || '-'}</td>
                  <td className="px-3 py-2">{row.consignee_name || '-'}</td>
                  <td className="px-3 py-2">{row.origin || '-'} to {row.destination || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && tab === 'outstanding' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left">Client</th>
                <th className="px-3 py-2 text-left">Invoices</th>
                <th className="px-3 py-2 text-left">Outstanding Total</th>
              </tr>
            </thead>
            <tbody>
              {outstandingRows.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-4 text-slate-500">No outstanding receivables.</td></tr>
              )}
              {outstandingRows.map((row) => (
                <tr key={row.party_id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{row.party_name}</td>
                  <td className="px-3 py-2">{row.invoice_count}</td>
                  <td className="px-3 py-2">{Number(row.outstanding_total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
