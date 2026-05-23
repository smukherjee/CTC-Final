import { useEffect, useMemo, useState } from 'react';

import AppAgGrid from '@/components/grid/AppAgGrid';
import { fetchReportRows } from '@/lib/api';
import { formatDisplayDate } from '@/utils/dateFormat';

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

interface PendingBillingReportProps {
  fy: string;
}

export default function PendingBillingReport({ fy }: PendingBillingReportProps) {
  const [rows, setRows] = useState<PendingBillingRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchReportRows<PendingBillingRow>('pending-billing', { fy })
      .then((data) => setRows(data))
      .catch((err) => {
        console.error('Failed to load pending billing report', err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [fy]);

  const colDefs = useMemo<any[]>(() => [
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

  return (
    <AppAgGrid<PendingBillingRow>
      rowData={rows}
      columnDefs={colDefs}
      loading={loading}
      noRowsMessage={`No pending billing rows for FY ${fy}.`}
      defaultColDef={{ editable: false }}
      getRowId={(params: any) => String(params.data.lr_id)}
      rowSelection={{ mode: 'singleRow', enableClickSelection: false, checkboxes: false }}
      fitColumns={false}
      alwaysShowHorizontalScroll={true}
    />
  );
}
