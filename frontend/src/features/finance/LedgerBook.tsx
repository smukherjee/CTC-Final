import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';
import { printVoucher } from '@/utils/printVoucher';

interface VoucherRow {
  id: number;
  voucher_type: string;
  reference_id?: number;
  reference_type?: string;
  amount: number;
  narration?: string;
  date: string;
}

type BookType = 'cash' | 'bank';

export default function LedgerBook() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState(currentFy);
  const [book, setBook] = useState<BookType>('cash');
  const [rows, setRows] = useState<VoucherRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/vouchers/', { params: { voucher_type: book, fy } })
      .then((res) => {
        setRows(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Failed to load vouchers', err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [book, fy]);

  const ledgerRows = useMemo(() => {
    let running = 0;
    return rows.map((row) => {
      const isDebit = String(row.voucher_type || '').toLowerCase().includes('debit');
      const debit = isDebit ? Number(row.amount || 0) : 0;
      const credit = isDebit ? 0 : Number(row.amount || 0);
      running += credit - debit;
      return {
        ...row,
        debit,
        credit,
        running_balance: running,
      };
    });
  }, [rows]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ledger Book</h2>
        <p className="text-sm text-slate-500">Cash Book and Bank Book with running balance from vouchers.</p>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="ledger_fy" className="text-sm font-medium text-slate-700">FY</label>
        <select
          id="ledger_fy"
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
        <button
          type="button"
          onClick={() => setBook('cash')}
          className={`rounded px-3 py-1 text-sm ${book === 'cash' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}
        >
          Cash Book
        </button>
        <button
          type="button"
          onClick={() => setBook('bank')}
          className={`rounded px-3 py-1 text-sm ${book === 'bank' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}
        >
          Bank Book
        </button>
      </div>

      <div className="overflow-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Narration</th>
              <th className="px-3 py-2 text-left">Debit</th>
              <th className="px-3 py-2 text-left">Credit</th>
              <th className="px-3 py-2 text-left">Running Balance</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-3 py-4 text-slate-500">Loading...</td></tr>
            )}
            {!loading && ledgerRows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-4 text-slate-500">No vouchers found.</td></tr>
            )}
            {!loading &&
              ledgerRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{row.narration || '-'}</td>
                  <td className="px-3 py-2">{row.debit ? row.debit.toFixed(2) : '-'}</td>
                  <td className="px-3 py-2">{row.credit ? row.credit.toFixed(2) : '-'}</td>
                  <td className="px-3 py-2">{row.running_balance.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => printVoucher(row)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      Print
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
