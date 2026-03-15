import { useEffect, useMemo, useState } from 'react';

import AppAgGrid from '@/components/grid/AppAgGrid';
import { fetchReportRows } from '@/lib/api';

interface OutstandingReceivableRow {
  client_id: number;
  client_name?: string;
  invoice_count?: number;
  outstanding_total?: number;
}

interface OutstandingReceivablesReportProps {
  fy: string;
}

export default function OutstandingReceivablesReport({ fy }: OutstandingReceivablesReportProps) {
  const [rows, setRows] = useState<OutstandingReceivableRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchReportRows<OutstandingReceivableRow>('outstanding-receivables', { fy })
      .then((data) => setRows(data))
      .catch((err) => {
        console.error('Failed to load outstanding receivables report', err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [fy]);

  const colDefs = useMemo<any[]>(() => [
    { field: 'client_name', headerName: 'Client', minWidth: 220, flex: 1.5, editable: false },
    { field: 'invoice_count', headerName: 'Invoices', minWidth: 130, flex: 1, editable: false },
    {
      field: 'outstanding_total',
      headerName: 'Outstanding Total',
      minWidth: 170,
      flex: 1,
      editable: false,
      currencyTotal: true,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: any) => Number(params.value || 0).toFixed(2),
    },
  ], []);

  return (
    <AppAgGrid<OutstandingReceivableRow>
      rowData={rows}
      columnDefs={colDefs}
      loading={loading}
      noRowsMessage={`No outstanding receivables for FY ${fy}.`}
      defaultColDef={{ editable: false }}
      getRowId={(params: any) => String(params.data.client_id)}
      rowSelection={{ mode: 'singleRow', enableClickSelection: false, checkboxes: false }}
      showCurrencyTotals={true}
      currencyTotalLabelField="client_name"
      fitColumns={false}
      alwaysShowHorizontalScroll={true}
    />
  );
}
