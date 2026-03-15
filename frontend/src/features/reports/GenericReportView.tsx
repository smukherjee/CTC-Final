import { useEffect, useMemo, useState } from 'react';

import AppAgGrid from '@/components/grid/AppAgGrid';
import { fetchReportRows } from '@/lib/api';
import type { ReportConfig } from '@/types/reports';

interface GenericReportViewProps {
  config: ReportConfig;
  fy: string;
}

export default function GenericReportView({ config, fy }: GenericReportViewProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      ...(config.params || {}),
    };
    if (config.supportsFy !== false && fy) {
      params.fy = fy;
    }
    return params;
  }, [config.params, config.supportsFy, fy]);

  useEffect(() => {
    let active = true;
    fetchReportRows(config.endpoint, queryParams)
      .then((data) => {
        if (active) {
          setRows(data as Record<string, unknown>[]);
        }
      })
      .catch((err) => {
        console.error(`Failed to load report: ${config.endpoint}`, err);
        if (active) {
          setRows([]);
        }
      });

    return () => {
      active = false;
    };
  }, [config.endpoint, queryParams]);

  return (
    <AppAgGrid<Record<string, unknown>>
      rowData={rows}
      columnDefs={config.columns}
      loading={false}
      noRowsMessage={config.noRowsMessage}
      defaultColDef={{ editable: false }}
      getRowId={(params: { data?: Record<string, unknown>; rowIndex?: number }) => {
        const record = (params.data || {}) as Record<string, unknown>;
        return String(record.id || record.invoice_id || record.voucher_id || record.hirememo_id || params.rowIndex);
      }}
      rowSelection={{ mode: 'singleRow', enableClickSelection: false, checkboxes: false }}
      showCurrencyTotals={true}
      fitColumns={false}
      alwaysShowHorizontalScroll={true}
      exportFileName={`report-${config.id}-${fy || 'all'}.csv`}
    />
  );
}
