import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import AppAgGrid from '@/components/grid/AppAgGrid';

interface BillBookRow {
  id: number;
  bill_number: string;
  bill_date: string;
  lr_number: string;
  date: string;
  origin: string;
  destination: string;
  customer_name: string;
  amount: number;
  amount_passed: number;
  deductions: string;
  remarks: string;
  cm_no: string;
  cm_date: string;
  status: string;
}

export default function BillBook() {
  const [rows, setRows] = useState<BillBookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get('/api/lr/')
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped: BillBookRow[] = data.map((it: any) => {
          const amount = Number(it.total || it.freight_amount || 0);
          return {
            id: Number(it.id),
            bill_number: it.bill_number || '',
            bill_date: it.bill_date || '',
            lr_number: it.lr_number || '',
            date: it.date || '',
            origin: it.origin || '',
            destination: it.destination || '',
            customer_name: it.consignee_name || it.consignor_name || '',
            amount,
            amount_passed: Number(it.amount_passed ?? amount),
            deductions: it.deductions ?? '',
            remarks: it.remarks || '',
            cm_no: it.cm_no || '',
            cm_date: it.cm_date || '',
            status: it.status || 'DRAFT',
          };
        });
        setRows(mapped);
      })
      .catch((err) => {
        console.error('Failed to load bill book rows', err);
        setRows([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.bill_number.toLowerCase().includes(q) ||
      r.lr_number.toLowerCase().includes(q) ||
      r.customer_name.toLowerCase().includes(q) ||
      r.origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const totalAmount = useMemo(() => filteredRows.reduce((s, r) => s + r.amount, 0), [filteredRows]);
  const totalPassed = useMemo(() => filteredRows.reduce((s, r) => s + r.amount_passed, 0), [filteredRows]);

  async function saveRow(row: BillBookRow) {
    try {
      await axios.put(`/api/lr/${row.id}`, {
        bill_number: row.bill_number || null,
        bill_date: row.bill_date || null,
        amount_passed: Number(row.amount_passed || 0),
        deductions: row.deductions || null,
        cm_no: row.cm_no || null,
        cm_date: row.cm_date || null,
        remarks: row.remarks || null,
        status: row.bill_number ? 'BILLED' : row.status,
      });
      console.log(`Saved bill entry for LR ${row.lr_number}`);
    } catch (err: any) {
      console.error(`Failed to save LR ${row.lr_number}:`, err?.response?.data?.detail || err.message);
    }
  }

  const onCellValueChanged = useCallback((event: any) => {
    const row = event.data as BillBookRow;
    if (!row?.id) return;
    setRows((prev) => prev.map((it) => (it.id === row.id ? row : it)));
    saveRow(row);
  }, []);

  const colDefs = useMemo<any[]>(() => [
    { field: 'bill_number', headerName: 'BILL NO.', width: 110, editable: true },
    {
      field: 'bill_date',
      headerName: 'BILL DATE',
      width: 120,
      editable: true,
      cellEditor: 'agDateCellEditor',
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const d = params.value instanceof Date ? params.value : parseISO(String(params.value));
        return Number.isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yyyy');
      },
      valueGetter: (params: any) => (params.data.bill_date ? parseISO(params.data.bill_date) : null),
      valueSetter: (params: any) => {
        if (!params.newValue) {
          params.data.bill_date = '';
          return true;
        }
        const d = params.newValue instanceof Date ? params.newValue : new Date(params.newValue);
        if (Number.isNaN(d.getTime())) return false;
        params.data.bill_date = format(d, 'yyyy-MM-dd');
        return true;
      },
    },
    { field: 'lr_number', headerName: 'LR NO.', width: 100, editable: false, pinned: 'left' },
    {
      field: 'date',
      headerName: 'LR DATE',
      width: 110,
      editable: false,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const d = parseISO(params.value);
        return Number.isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yyyy');
      },
    },
    { field: 'origin', headerName: 'ORIGIN', width: 120, editable: false },
    { field: 'destination', headerName: 'DESTINATION', width: 130, editable: false },
    { field: 'customer_name', headerName: 'CUSTOMER NAME', width: 220, editable: false },
    {
      field: 'amount',
      headerName: 'AMOUNT',
      width: 120,
      editable: false,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    {
      field: 'amount_passed',
      headerName: 'AMOUNT PASSED',
      width: 140,
      editable: true,
      cellDataType: 'number',
      cellStyle: { textAlign: 'right' },
      valueParser: (params: any) => Number(params.newValue || 0),
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    { field: 'deductions', headerName: 'DEDUCTIONS', width: 140, editable: true },
    { field: 'remarks', headerName: 'REMARKS', width: 180, editable: true },
    { field: 'cm_no', headerName: 'CM NO.', width: 110, editable: true },
    {
      field: 'cm_date',
      headerName: 'CM DATE',
      width: 120,
      editable: true,
      cellEditor: 'agDateCellEditor',
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const d = params.value instanceof Date ? params.value : parseISO(String(params.value));
        return Number.isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yyyy');
      },
      valueGetter: (params: any) => (params.data.cm_date ? parseISO(params.data.cm_date) : null),
      valueSetter: (params: any) => {
        if (!params.newValue) {
          params.data.cm_date = '';
          return true;
        }
        const d = params.newValue instanceof Date ? params.newValue : new Date(params.newValue);
        if (Number.isNaN(d.getTime())) return false;
        params.data.cm_date = format(d, 'yyyy-MM-dd');
        return true;
      },
    },
    { field: 'status', headerName: 'STATUS', width: 120, editable: false },
  ], []);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bill Notebook</h2>
          <p className="text-sm text-slate-500 mt-1">Format aligned to sample register (BILL NO, LR NO, AMOUNT, PASSED, DEDUCTIONS)</p>
        </div>
        <div className="text-right text-sm">
          <div>Total Amount: <span className="font-semibold">Rs. {totalAmount.toFixed(2)}</span></div>
          <div>Amount Passed: <span className="font-semibold">Rs. {totalPassed.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Bill No / LR No / Customer / Origin / Destination"
          className="w-full md:w-96 border rounded px-3 py-2"
        />
      </div>

      <AppAgGrid<BillBookRow>
        rowData={filteredRows}
        columnDefs={colDefs}
        className="dispatch-grid"
        loading={loading}
        onCellValueChanged={onCellValueChanged}
        getRowId={(params: any) => String(params.data.id)}
        rowSelection={{
          mode: 'singleRow',
          enableClickSelection: false,
          checkboxes: false,
        }}
        fitColumns={false}
        alwaysShowHorizontalScroll={true}
      />
    </div>
  );
}
