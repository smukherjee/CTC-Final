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
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      ...(config.params || {}),
    };
    if (config.supportsFy !== false && fy) {
      params.fy = fy;
    }
    if (config.serverSearch && debouncedQuery) {
      params.q = debouncedQuery;
    }
    return params;
  }, [config.params, config.serverSearch, config.supportsFy, debouncedQuery, fy]);

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

  const filteredRows = useMemo(() => {
    if (config.serverSearch) {
      return rows;
    }
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row || {}).some((value) => String(value ?? '').toLowerCase().includes(q)),
    );
  }, [config.serverSearch, rows, query]);

  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-lg p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search visible report rows..."
          className="w-full md:w-96 border rounded px-3 py-2"
        />
      </div>
      <AppAgGrid<Record<string, unknown>>
        rowData={filteredRows}
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
    </div>
  );
}
