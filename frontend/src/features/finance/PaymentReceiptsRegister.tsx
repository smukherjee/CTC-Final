import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import AppAgGrid from '@/components/grid/AppAgGrid';
import { formatDisplayDate } from '@/utils/dateFormat';
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

  const colDefs = useMemo<any[]>(() => [
    {
      field: 'payment_date',
      headerName: 'PAYMENT DATE',
      minWidth: 150,
      flex: 1,
      editable: false,
      valueFormatter: (params: any) => formatDisplayDate(params.value),
    },
    {
      field: 'amount',
      headerName: 'AMOUNT',
      minWidth: 140,
      flex: 1,
      editable: false,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    {
      field: 'received_from',
      headerName: 'RECEIVED FROM',
      minWidth: 220,
      flex: 1.3,
      editable: false,
    },
    {
      field: 'notes',
      headerName: 'NOTES',
      minWidth: 220,
      flex: 1.5,
      editable: false,
      valueGetter: (params: any) => params.data.notes || '-',
    },
    {
      headerName: 'ACTIONS',
      minWidth: 170,
      flex: 1,
      editable: false,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <div className="flex h-full items-center gap-2">
          <button type="button" onClick={() => editRow(params.data)} className="rounded border px-2 py-1 text-xs">Edit</button>
          <button type="button" onClick={() => removeRow(params.data.id)} className="rounded border px-2 py-1 text-xs text-red-700">Delete</button>
        </div>
      ),
    },
  ], [editRow, removeRow]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payment Receipts Register</h2>
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

      <AppAgGrid<PaymentReceiptRow>
        rowData={rows}
        columnDefs={colDefs}
        loading={loading}
        noRowsMessage={`No payment receipts found for FY ${fy}.`}
        defaultColDef={{ editable: false }}
        getRowId={(params: any) => String(params.data.id)}
        rowSelection={{ mode: 'singleRow', enableClickSelection: false, checkboxes: false }}
        fitColumns={false}
        alwaysShowHorizontalScroll={true}
      />
    </div>
  );
}
