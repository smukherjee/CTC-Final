import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppAgGrid from '@/components/grid/AppAgGrid';
import { formatDisplayDate } from '@/utils/dateFormat';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';

type ReportTab = 'pending' | 'outstanding';

interface PendingBillingRow {
  lr_id: number;
  lr_number?: string;
  date?: string;
  vehicle_number?: string;
  consignor_name?: string;
  consignee_name?: string;
  origin?: string;
  destination?: string;
}

interface OutstandingReceivableRow {
  client_id: number;
  client_name?: string;
  invoice_count?: number;
  outstanding_total?: number;
}

export default function Reports() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState(currentFy);
  const [tab, setTab] = useState<ReportTab>('pending');
  const [pendingRows, setPendingRows] = useState<PendingBillingRow[]>([]);
  const [outstandingRows, setOutstandingRows] = useState<OutstandingReceivableRow[]>([]);
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

  const pendingColDefs = useMemo<any[]>(() => [
    { field: 'lr_number', headerName: 'LR No', minWidth: 140, flex: 1, editable: false },
    {
      field: 'date',
      headerName: 'Date',
      minWidth: 130,
      flex: 1,
      editable: false,
      valueFormatter: (params: any) => formatDisplayDate(params.value),
    },
    { field: 'vehicle_number', headerName: 'Vehicle', minWidth: 150, flex: 1, editable: false, valueGetter: (params: any) => params.data.vehicle_number || '-' },
    { field: 'consignor_name', headerName: 'Consignor', minWidth: 220, flex: 1.4, editable: false, valueGetter: (params: any) => params.data.consignor_name || '-' },
    { field: 'consignee_name', headerName: 'Consignee', minWidth: 220, flex: 1.4, editable: false, valueGetter: (params: any) => params.data.consignee_name || '-' },
    {
      headerName: 'Route',
      minWidth: 220,
      flex: 1.3,
      editable: false,
      valueGetter: (params: any) => `${params.data.origin || '-'} to ${params.data.destination || '-'}`,
    },
  ], []);

  const outstandingColDefs = useMemo<any[]>(() => [
    { field: 'client_name', headerName: 'Client', minWidth: 220, flex: 1.5, editable: false },
    { field: 'invoice_count', headerName: 'Invoices', minWidth: 130, flex: 1, editable: false },
    {
      field: 'outstanding_total',
      headerName: 'Outstanding Total',
      minWidth: 170,
      flex: 1,
      editable: false,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
  ], []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h2>
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

      <AppAgGrid<PendingBillingRow | OutstandingReceivableRow>
        rowData={tab === 'pending' ? pendingRows : outstandingRows}
        columnDefs={tab === 'pending' ? pendingColDefs : outstandingColDefs}
        loading={loading}
        noRowsMessage={tab === 'pending' ? `No pending billing rows for FY ${fy}.` : `No outstanding receivables for FY ${fy}.`}
        defaultColDef={{ editable: false }}
        getRowId={(params: any) => String(params.data.lr_id ?? params.data.client_id)}
        rowSelection={{ mode: 'singleRow', enableClickSelection: false, checkboxes: false }}
        fitColumns={false}
        alwaysShowHorizontalScroll={true}
      />
    </div>
  );
}
