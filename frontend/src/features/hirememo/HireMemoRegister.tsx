import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppAgGrid from '@/components/grid/AppAgGrid';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';

interface HireMemoRow {
  id: number;
  hire_memo_no?: string;
  hire_memo_date?: string;
  financial_year?: string;
  lr_id: number;
  lr_number?: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_mobile?: string;
  total_amount?: number;
  advance_cash?: number;
  advance_bank?: number;
  balance?: number;
}

export default function HireMemoRegister() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState<string>(currentFy);
  const [rowData, setRowData] = useState<HireMemoRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const [hmRes, lrRes] = await Promise.all([
        axios.get('/api/hirememo/', { params: { fy } }),
        axios.get('/api/lr/', { params: { fy } }),
      ]);
      const hmRows = Array.isArray(hmRes.data) ? hmRes.data : [];
      const lrRows = Array.isArray(lrRes.data) ? lrRes.data : [];
      const lrNoById: Record<string, string> = {};
      lrRows.forEach((lr: any) => {
        if (lr?.id !== undefined && lr?.id !== null) {
          lrNoById[String(lr.id)] = String(lr.lr_number || '');
        }
      });
      setRowData(
        hmRows.map((r: any) => ({
          ...r,
          lr_number: r.lr_number || lrNoById[String(r.lr_id)] || '',
        })),
      );
    } catch (err) {
      console.error('Failed to load hire memos', err);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [fy]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const onCellValueChanged = useCallback(async (event: any) => {
    const row = event?.data as HireMemoRow | undefined;
    if (!row?.id) return;
    try {
      await axios.put(`/api/hirememo/${row.id}`, {
        hire_memo_date: row.hire_memo_date || null,
        vehicle_number: row.vehicle_number || null,
        driver_name: row.driver_name || null,
        driver_mobile: row.driver_mobile || null,
        total_amount: Number(row.total_amount || 0),
        advance_cash: Number(row.advance_cash || 0),
        advance_bank: Number(row.advance_bank || 0),
      });
      await loadRows();
    } catch (err: any) {
      alert(`Failed to save Hire Memo: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    }
  }, [loadRows]);

  const colDefs = useMemo<any[]>(() => [
    {
      field: 'hire_memo_no',
      headerName: 'HM No',
      width: 120,
      pinned: 'left',
      editable: false,
      cellRenderer: (params: { value?: string; data: HireMemoRow }) => (
        <button
          type="button"
          onClick={() => {
            const lrId = Number(params.data.lr_id);
            if (!Number.isFinite(lrId) || lrId <= 0) return;
            window.location.href = `/operations/hirememo?lr_id=${lrId}`;
          }}
          className="text-blue-700 hover:text-blue-900 hover:underline font-semibold"
        >
          {params.value || '-'}
        </button>
      ),
    },
    {
      field: 'hire_memo_date',
      headerName: 'Date',
      width: 120,
      editable: true,
      cellEditor: 'agDateCellEditor',
    },
    {
      field: 'lr_number',
      headerName: 'LR',
      width: 140,
      editable: false,
      valueGetter: (params: any) => params.data.lr_number || `LR-${params.data.lr_id}`,
    },
    {
      field: 'vehicle_number',
      headerName: 'Vehicle No',
      width: 140,
      editable: true,
    },
    {
      field: 'driver_name',
      headerName: 'Driver',
      width: 140,
      editable: true,
    },
    {
      field: 'driver_mobile',
      headerName: 'Driver Mobile',
      width: 150,
      editable: true,
    },
    {
      field: 'total_amount',
      headerName: 'Total Hire',
      width: 140,
      editable: true,
      valueParser: (params: any) => Number(params.newValue || 0),
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'advance_cash',
      headerName: 'Adv Cash',
      width: 120,
      editable: true,
      valueParser: (params: any) => Number(params.newValue || 0),
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'advance_bank',
      headerName: 'Adv Bank',
      width: 120,
      editable: true,
      valueParser: (params: any) => Number(params.newValue || 0),
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'balance',
      headerName: 'Balance',
      width: 130,
      editable: false,
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
      cellStyle: { textAlign: 'right', backgroundColor: '#f8fafc', fontWeight: 600 },
    },
  ], []);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Hire Memo Register</h2>
          <p className="text-sm text-slate-500">Track and edit hire memos by financial year.</p>
        </div>
        <select
          value={fy}
          onChange={(e) => setFy(e.target.value)}
          aria-label="Financial year"
          className="px-3 py-2 border border-slate-200 rounded-md bg-white"
        >
          {fyOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <AppAgGrid<HireMemoRow>
        rowData={rowData}
        columnDefs={colDefs}
        onCellValueChanged={onCellValueChanged}
        loading={loading}
        editType="fullRow"
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        rowSelection={{ mode: 'singleRow', enableClickSelection: false }}
        fitColumns={false}
        alwaysShowHorizontalScroll={true}
      />
    </div>
  );
}
