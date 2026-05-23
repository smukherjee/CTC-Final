import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { format, parseISO } from 'date-fns';
import AppAgGrid from '@/components/grid/AppAgGrid';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';

interface BillBookRow {
  id: string;
  invoice_id: number;
  invoice_no: string;
  invoice_date: string;
  client_id: number;
  client_name: string;
  // status column is no longer shown in the grid but we keep it here for completeness
  status: string;
  lr_id?: number;
  lr_number: string;
  lr_date: string;
  origin: string;
  destination: string;
  amount_passed: number;
  tds_amount: number;
  net_amount: number;
  amount_received: number;
  outstanding_amount: number;
  edited: boolean;
  edited_at?: string;
  edited_by?: string;
}

export default function BillBook() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [rows, setRows] = useState<BillBookRow[]>([]);
  const [clientMap, setClientMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [fy, setFy] = useState(currentFy);

  useEffect(() => {
    apiClient.get('/api/clients/')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped: Record<number, string> = {};
        data.forEach((client: any) => {
          const id = Number(client?.id);
          if (Number.isFinite(id) && id > 0) {
            mapped[id] = String(client?.name || client?.client_name || `Client ${id}`);
          }
        });
        setClientMap(mapped);
      })
      .catch((err) => {
        console.error('Failed to load clients for BillBook', err);
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiClient.get('/api/billing/invoices/', { params: { fy } })
      .then((res) => {
        if (!mounted) return;
        const invoices = Array.isArray(res.data) ? res.data : [];

        const mappedRows: BillBookRow[] = invoices.flatMap((invoice: any) => {
          const invoiceId = Number(invoice.id);
          const invoiceNo = String(invoice.invoice_no || '');
          const invoiceDate = String(invoice.invoice_date || '');
          const clientId = Number(invoice.client_id || 0);
          const clientName = clientMap[clientId] || `Client ${clientId || '-'}`;
          const status = String(invoice.status || 'draft');
          const amountPassed = Number(invoice.total_amount || 0);
          const tdsAmount = Number(invoice.tds_amount || 0);
          const netAmount = Number(
            invoice.net_amount !== undefined && invoice.net_amount !== null
              ? invoice.net_amount
              : amountPassed - tdsAmount,
          );
          const amountReceived = Number(invoice.amount_received || 0);
          const outstandingAmount = Number(invoice.outstanding_amount || Math.max(netAmount - amountReceived, 0));
          const edited = Boolean(invoice.edited);
          const editedAt = invoice.edited_at ? String(invoice.edited_at) : undefined;
          const editedBy = invoice.edited_by ? String(invoice.edited_by) : undefined;
          const lines = Array.isArray(invoice.lines) ? invoice.lines : [];

          if (lines.length === 0) {
            return [{
              id: `${invoiceId}-0`,
              invoice_id: invoiceId,
              invoice_no: invoiceNo,
              invoice_date: invoiceDate,
              client_id: clientId,
              client_name: clientName,
              status,
              lr_id: undefined,
              lr_number: '',
              lr_date: '',
              origin: '',
              destination: '',
              amount_passed: amountPassed,
              tds_amount: tdsAmount,
              net_amount: netAmount,
              amount_received: amountReceived,
              outstanding_amount: outstandingAmount,
              edited,
              edited_at: editedAt,
              edited_by: editedBy,
            }];
          }

          return lines.map((line: any, idx: number) => ({
            id: `${invoiceId}-${idx + 1}`,
            invoice_id: invoiceId,
            invoice_no: invoiceNo,
            invoice_date: invoiceDate,
            client_id: clientId,
            client_name: clientName,
            status,
            lr_id: line?.lr_id ? Number(line.lr_id) : undefined,
            lr_number: String(line?.lr_no || ''),
            lr_date: String(line?.lr_date || ''),
            origin: String(line?.from_city || ''),
            destination: String(line?.to_city || ''),
            amount_passed: amountPassed,
            tds_amount: tdsAmount,
            net_amount: netAmount,
            amount_received: amountReceived,
            outstanding_amount: outstandingAmount,
            edited,
            edited_at: editedAt,
            edited_by: editedBy,
          }));
        });
        setRows(mappedRows);
      })
      .catch((err) => {
        console.error('Failed to load invoice register', err);
        setRows([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [fy, clientMap]);


  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.invoice_no.toLowerCase().includes(q) ||
      r.lr_number.toLowerCase().includes(q) ||
      r.client_name.toLowerCase().includes(q) ||
      r.origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const outstandingSummary = useMemo(() => {
    const invoiceMap = new Map<number, number>();
    filteredRows.forEach((row) => {
      if (!invoiceMap.has(row.invoice_id)) {
        invoiceMap.set(row.invoice_id, Number(row.outstanding_amount || 0));
      }
    });
    return Array.from(invoiceMap.values()).reduce((sum, value) => sum + value, 0);
  }, [filteredRows]);

  const colDefs = useMemo<any[]>(() => [
    { field: 'invoice_no', headerName: 'INVOICE NO.', width: 130, editable: false },
    {
      field: 'invoice_date',
      headerName: 'INVOICE DATE',
      width: 120,
      editable: false,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        try {
          const d = parseISO(String(params.value));
          return Number.isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yyyy');
        } catch {
          return '';
        }
      },
    },
    { field: 'client_name', headerName: 'CLIENT', width: 180, editable: false },
    {
      field: 'lr_number',
      headerName: 'LR NO.',
      width: 120,
      editable: false,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const row: BillBookRow = params.data;
        const lrNum = params.value || '';
        if (row.lr_id) {
          return (
            <a
              href={`/operations/lr/${row.lr_id}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 hover:underline font-medium"
            >
              {lrNum || `LR-${row.lr_id}`}
            </a>
          );
        }
        return lrNum;
      },
    },
    {
      field: 'lr_date',
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
    {
      field: 'amount_passed',
      headerName: 'AMOUNT PASSED',
      width: 120,
      editable: false,
      currencyTotal: true,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    {
      field: 'tds_amount',
      headerName: 'TDS AMOUNT',
      width: 140,
      editable: false,
      currencyTotal: true,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    {
      field: 'net_amount',
      headerName: 'NET AMOUNT',
      width: 140,
      editable: false,
      currencyTotal: true,
      valueGetter: (params: any) => {
        const amountPassed = Number(params.data.amount_passed || 0);
        const tdsAmount = Number(params.data.tds_amount || 0);
        return amountPassed - tdsAmount;
      },
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    {
      field: 'amount_received',
      headerName: 'AMOUNT RECEIVED',
      width: 150,
      editable: false,
      currencyTotal: true,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    {
      field: 'outstanding_amount',
      headerName: 'OUTSTANDING',
      width: 140,
      editable: false,
      currencyTotal: true,
      cellStyle: { textAlign: 'right', fontWeight: 600 },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    { field: 'status', headerName: 'STATUS', width: 140, editable: false },
    {
      field: 'audit_hint',
      headerName: 'EDITED AT/BY',
      width: 190,
      editable: false,
      cellRenderer: (params: any) => {
        const row: BillBookRow = params.data;
        if (!String(row.id).endsWith('-1') && !String(row.id).endsWith('-0')) return '';
        if (!row.edited || !row.edited_at) return <span className="text-xs text-slate-500">-</span>;
        let editedAtLabel = row.edited_at;
        try {
          const dt = parseISO(String(row.edited_at));
          editedAtLabel = Number.isNaN(dt.getTime()) ? String(row.edited_at) : format(dt, 'dd/MM/yyyy HH:mm');
        } catch {
          editedAtLabel = String(row.edited_at);
        }
        return (
          <div className="text-xs leading-tight">
            <div className="font-medium text-slate-700">{editedAtLabel}</div>
            <div className="text-slate-500">{row.edited_by || 'system'}</div>
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 130,
      editable: false,
      pinned: 'right',
      cellRenderer: (params: any) => {
        const row: BillBookRow = params.data;
        const status = String(row.status || '').toLowerCase();
        if (!row.invoice_id) return '-';
        if (!String(row.id).endsWith('-1') && !String(row.id).endsWith('-0')) return '';
        if (status === 'paid') {
          return <span className="text-xs text-slate-500">Locked</span>;
        }
        return (
          <Link
            to={`/finance/invoices/${row.invoice_id}/edit`}
            className="text-blue-700 hover:underline font-medium"
          >
            Edit
          </Link>
        );
      },
    },
  ], []);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invoice Register</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Invoice No / LR No / Client / Origin / Destination"
            className="w-72 px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <label htmlFor="billbook_fy" className="text-sm font-medium text-slate-700">FY</label>
          <select
            id="billbook_fy"
            value={fy}
            onChange={(e) => setFy(e.target.value)}
            className="w-28 rounded border px-2 py-2 text-sm bg-white"
          >
            {fyOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <Link
            to="/finance/invoices/new"
            className="inline-block rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            + Invoice
          </Link>
        </div>
      </div>

      <div className="rounded border bg-white p-3 text-sm text-slate-700">
        Outstanding Summary:
        <span className="ml-2 font-semibold text-slate-900">{outstandingSummary.toFixed(2)}</span>
      </div>

      <AppAgGrid<BillBookRow>
        rowData={filteredRows}
        columnDefs={colDefs}
        className="dispatch-grid"
        loading={loading}
        noRowsMessage={`No invoices found for FY ${fy}.`}
        getRowId={(params: any) => params.data.id}
        rowSelection={{
          mode: 'singleRow',
          enableClickSelection: false,
          checkboxes: false,
        }}
        showCurrencyTotals={true}
        currencyTotalLabelField="invoice_no"
        fitColumns={false}
        alwaysShowHorizontalScroll={true}
      />
    </div>
  );
}
