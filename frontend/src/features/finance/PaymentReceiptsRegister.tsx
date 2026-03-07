import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';

interface PaymentReceiptRow {
  id: number;
  payment_date: string;
  amount: number;
  received_from: string;
  financial_year: string;
  notes?: string | null;
}

export default function PaymentReceiptsRegister() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState(currentFy);
  const [rows, setRows] = useState<PaymentReceiptRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    amount: '',
    received_from: '',
    notes: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/payment-receipts/', { params: { fy } });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load payment receipts', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fy]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [rows],
  );

  const resetForm = () => {
    setForm({
      payment_date: new Date().toISOString().slice(0, 10),
      amount: '',
      received_from: '',
      notes: '',
    });
    setEditingId(null);
  };

  const submit = async () => {
    if (!form.payment_date || !form.amount || !form.received_from.trim()) {
      alert('Payment date, amount and received from are required');
      return;
    }

    const payload = {
      payment_date: form.payment_date,
      amount: Number(form.amount),
      received_from: form.received_from.trim(),
      financial_year: fy,
      notes: form.notes.trim() || null,
    };

    try {
      if (editingId) {
        await axios.put(`/api/payment-receipts/${editingId}`, payload);
      } else {
        await axios.post('/api/payment-receipts/', payload);
      }
      resetForm();
      await loadRows();
    } catch (err: any) {
      alert(`Failed to save payment receipt: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    }
  };

  const editRow = (row: PaymentReceiptRow) => {
    setEditingId(row.id);
    setForm({
      payment_date: row.payment_date ? String(row.payment_date).slice(0, 10) : '',
      amount: String(row.amount ?? ''),
      received_from: row.received_from || '',
      notes: row.notes || '',
    });
  };

  const removeRow = async (id: number) => {
    if (!window.confirm('Delete this payment receipt?')) return;
    try {
      await axios.delete(`/api/payment-receipts/${id}`);
      await loadRows();
    } catch (err: any) {
      alert(`Failed to delete: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payment Receipts Register</h2>
          <p className="text-sm text-slate-500">Maintain FY-scoped payment receipts with inline add/edit/delete.</p>
        </div>
        <div className="text-right text-sm">
          <div>Total Receipts: <span className="font-semibold">Rs. {totalAmount.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="receipts_fy" className="text-sm font-medium text-slate-700">FY</label>
        <select
          id="receipts_fy"
          value={fy}
          onChange={(e) => setFy(e.target.value)}
          className="w-28 rounded border px-2 py-1 text-sm"
        >
          {fyOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-2 rounded border bg-white p-4 md:grid-cols-6">
        <input type="date" value={form.payment_date} onChange={(e) => setForm((p) => ({ ...p, payment_date: e.target.value }))} className="rounded border px-2 py-2" />
        <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="rounded border px-2 py-2" />
        <input placeholder="Received From" value={form.received_from} onChange={(e) => setForm((p) => ({ ...p, received_from: e.target.value }))} className="rounded border px-2 py-2 md:col-span-2" />
        <input placeholder="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="rounded border px-2 py-2 md:col-span-2" />
        <div className="flex gap-2 md:col-span-6">
          <button type="button" onClick={submit} className="rounded bg-slate-900 px-4 py-2 text-white">
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded border px-4 py-2 text-slate-700">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="overflow-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left">PAYMENT DATE</th>
              <th className="px-3 py-2 text-left">AMOUNT</th>
              <th className="px-3 py-2 text-left">RECEIVED FROM</th>
              <th className="px-3 py-2 text-left">NOTES</th>
              <th className="px-3 py-2 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-slate-500">Loading...</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-slate-500">No payment receipts found for FY {fy}</td>
              </tr>
            )}
            {!loading && rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{new Date(row.payment_date).toLocaleDateString()}</td>
                <td className="px-3 py-2">{Number(row.amount || 0).toFixed(2)}</td>
                <td className="px-3 py-2">{row.received_from}</td>
                <td className="px-3 py-2">{row.notes || '-'}</td>
                <td className="px-3 py-2 space-x-2">
                  <button type="button" onClick={() => editRow(row)} className="rounded border px-2 py-1 text-xs">Edit</button>
                  <button type="button" onClick={() => removeRow(row.id)} className="rounded border px-2 py-1 text-xs text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
