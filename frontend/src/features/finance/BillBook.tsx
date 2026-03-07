import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import AppAgGrid from '@/components/grid/AppAgGrid';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';

interface BillBookRow {
  id: string;
  invoice_id: number;
  invoice_no: string;
  invoice_date: string;
  party_id: number;
  party_name: string;
  status: string;
  lr_number: string;
  lr_date: string;
  origin: string;
  destination: string;
  amount_passed: number;
  tds_amount: number;
  net_amount: number;
}

export default function BillBook() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [rows, setRows] = useState<BillBookRow[]>([]);
  const [invoiceSummary, setInvoiceSummary] = useState<any[]>([]);
  const [partyMap, setPartyMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [fy, setFy] = useState(currentFy);
  const [activePartyId, setActivePartyId] = useState<number | 'all'>('all');

  useEffect(() => {
    axios.get('/api/party/')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped: Record<number, string> = {};
        data.forEach((party: any) => {
          const id = Number(party?.id);
          if (Number.isFinite(id) && id > 0) {
            mapped[id] = String(party?.name || party?.party_name || `Party ${id}`);
          }
        });
        setPartyMap(mapped);
      })
      .catch((err) => {
        console.error('Failed to load parties for BillBook', err);
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get('/api/billing/invoices/', { params: { fy } })
      .then((res) => {
        if (!mounted) return;
        const invoices = Array.isArray(res.data) ? res.data : [];
        setInvoiceSummary(invoices);

        const mappedRows: BillBookRow[] = invoices.flatMap((invoice: any) => {
          const invoiceId = Number(invoice.id);
          const invoiceNo = String(invoice.invoice_no || '');
          const invoiceDate = String(invoice.invoice_date || '');
          const partyId = Number(invoice.party_id || 0);
          const partyName = partyMap[partyId] || `Party ${partyId || '-'}`;
          const status = String(invoice.status || 'draft');
          const amountPassed = Number(invoice.total_amount || 0);
          const tdsAmount = Number(invoice.tds_amount || 0);
          const netAmount = Number(
            invoice.net_amount !== undefined && invoice.net_amount !== null
              ? invoice.net_amount
              : amountPassed - tdsAmount,
          );
          const lines = Array.isArray(invoice.lines) ? invoice.lines : [];

          if (lines.length === 0) {
            return [{
              id: `${invoiceId}-0`,
              invoice_id: invoiceId,
              invoice_no: invoiceNo,
              invoice_date: invoiceDate,
              party_id: partyId,
              party_name: partyName,
              status,
              lr_number: '',
              lr_date: '',
              origin: '',
              destination: '',
              amount_passed: amountPassed,
              tds_amount: tdsAmount,
              net_amount: netAmount,
            }];
          }

          return lines.map((line: any, idx: number) => ({
            id: `${invoiceId}-${idx + 1}`,
            invoice_id: invoiceId,
            invoice_no: invoiceNo,
            invoice_date: invoiceDate,
            party_id: partyId,
            party_name: partyName,
            status,
            lr_number: String(line?.lr_no || ''),
            lr_date: String(line?.lr_date || ''),
            origin: String(line?.from_city || ''),
            destination: String(line?.to_city || ''),
            amount_passed: amountPassed,
            tds_amount: tdsAmount,
            net_amount: netAmount,
          }));
        });
        setRows(mappedRows);
      })
      .catch((err) => {
        console.error('Failed to load invoice register', err);
        setInvoiceSummary([]);
        setRows([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [fy, partyMap]);

  const partyTabs = useMemo(() => {
    const ids = Array.from(new Set(invoiceSummary.map((invoice: any) => Number(invoice.party_id)).filter((id: number) => Number.isFinite(id) && id > 0)));
    return ids.map((id) => ({
      id,
      label: partyMap[id] || `Party ${id}`,
      outstanding: invoiceSummary
        .filter((invoice: any) => Number(invoice.party_id) === id && String(invoice.status || '').toLowerCase() !== 'paid')
        .reduce((sum: number, invoice: any) => sum + Number(invoice.net_amount || invoice.total_amount || 0), 0),
    }));
  }, [invoiceSummary, partyMap]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = activePartyId === 'all' ? rows : rows.filter((row) => row.party_id === activePartyId);
    if (!q) return base;
    return base.filter((r) =>
      r.invoice_no.toLowerCase().includes(q) ||
      r.lr_number.toLowerCase().includes(q) ||
      r.party_name.toLowerCase().includes(q) ||
      r.origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q)
    );
  }, [rows, query, activePartyId]);

  const totalPassed = useMemo(() => filteredRows.reduce((s, r) => s + Number(r.amount_passed || 0), 0), [filteredRows]);
  const totalTds = useMemo(() => filteredRows.reduce((s, r) => s + Number(r.tds_amount || 0), 0), [filteredRows]);
  const totalNet = useMemo(() => filteredRows.reduce((s, r) => s + Number(r.net_amount || 0), 0), [filteredRows]);

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
    { field: 'party_name', headerName: 'CLIENT', width: 180, editable: false },
    { field: 'lr_number', headerName: 'LR NO.', width: 120, editable: false, pinned: 'left' },
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
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    {
      field: 'tds_amount',
      headerName: 'TDS AMOUNT',
      width: 140,
      editable: false,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    {
      field: 'net_amount',
      headerName: 'NET AMOUNT',
      width: 140,
      editable: false,
      valueGetter: (params: any) => {
        const amountPassed = Number(params.data.amount_passed || 0);
        const tdsAmount = Number(params.data.tds_amount || 0);
        return amountPassed - tdsAmount;
      },
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
    { field: 'status', headerName: 'STATUS', width: 120, editable: false },
  ], []);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bill Notebook</h2>
          <p className="text-sm text-slate-500 mt-1">Invoice register by client with FY filter and outstanding tracking.</p>
        </div>
        <div className="text-right text-sm space-y-2">
          <div>Amount Passed: <span className="font-semibold">Rs. {totalPassed.toFixed(2)}</span></div>
          <div>TDS Amount: <span className="font-semibold">Rs. {totalTds.toFixed(2)}</span></div>
          <div>Net Amount: <span className="font-semibold">Rs. {totalNet.toFixed(2)}</span></div>
          <Link
            to="/finance/invoices/new"
            className="inline-block rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
          >
            Create Invoice
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="billbook_fy" className="text-sm font-medium text-slate-700">FY</label>
        <select
          id="billbook_fy"
          value={fy}
          onChange={(e) => setFy(e.target.value)}
          className="w-28 rounded border px-2 py-1 text-sm"
        >
          {fyOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActivePartyId('all')}
          className={`rounded px-3 py-1 text-sm ${activePartyId === 'all' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}
        >
          All
        </button>
        {partyTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActivePartyId(tab.id)}
            className={`rounded px-3 py-1 text-sm ${activePartyId === tab.id ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}
            title={`Outstanding: Rs. ${tab.outstanding.toFixed(2)}`}
          >
            {tab.label} (Rs. {tab.outstanding.toFixed(0)})
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Invoice No / LR No / Client / Origin / Destination"
          className="w-full md:w-96 border rounded px-3 py-2"
        />
      </div>

      <AppAgGrid<BillBookRow>
        rowData={filteredRows}
        columnDefs={colDefs}
        className="dispatch-grid"
        loading={loading}
        getRowId={(params: any) => params.data.id}
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
