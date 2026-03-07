import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import AppAgGrid from '@/components/grid/AppAgGrid';
import { formatDisplayDate } from '@/utils/dateFormat';
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

  const colDefs = useMemo<any[]>(() => [
    {
      field: 'date',
      headerName: 'Date',
      minWidth: 130,
      flex: 1,
      editable: false,
      valueFormatter: (params: any) => formatDisplayDate(params.value),
    },
    {
      field: 'narration',
      headerName: 'Narration',
      minWidth: 260,
      flex: 1.8,
      editable: false,
      valueGetter: (params: any) => params.data.narration || '-',
    },
    {
      field: 'debit',
      headerName: 'Debit',
      minWidth: 130,
      flex: 1,
      editable: false,
      currencyTotal: true,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => (params.value ? Number(params.value).toFixed(2) : '-'),
    },
    {
      field: 'credit',
      headerName: 'Credit',
      minWidth: 130,
      flex: 1,
      editable: false,
      currencyTotal: true,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => (params.value ? Number(params.value).toFixed(2) : '-'),
    },
    {
      field: 'running_balance',
      headerName: 'Running Balance',
      minWidth: 150,
      flex: 1,
      editable: false,
      currencyTotal: true,
      currencyTotalMode: 'last',
      cellStyle: { textAlign: 'right', fontWeight: 600 },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    {
      headerName: 'Actions',
      minWidth: 120,
      flex: 0.8,
      editable: false,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <button
          type="button"
          onClick={() => printVoucher(params.data)}
          className="rounded border px-2 py-1 text-xs"
        >
          Print
        </button>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ledger Book</h2>
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

      <AppAgGrid<(VoucherRow & { debit: number; credit: number; running_balance: number })>
        rowData={ledgerRows}
        columnDefs={colDefs}
        loading={loading}
        noRowsMessage={`No ${book} book vouchers found for FY ${fy}.`}
        defaultColDef={{ editable: false }}
        getRowId={(params: any) => String(params.data.id)}
        rowSelection={{ mode: 'singleRow', enableClickSelection: false, checkboxes: false }}
        showCurrencyTotals={true}
        currencyTotalLabelField="narration"
        fitColumns={false}
        alwaysShowHorizontalScroll={true}
      />
    </div>
  );
}
