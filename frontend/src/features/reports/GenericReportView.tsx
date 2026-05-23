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

  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="bg-white border rounded-lg p-3 w-full">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search visible report rows..."
            className="w-full md:w-96 border rounded px-3 py-2"
          />
        </div>
        {config.helpText && (
          <div className="relative ml-2 flex-shrink-0">
            <button
              type="button"
              aria-label="Help"
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-full w-7 h-7 flex items-center justify-center text-lg font-bold shadow transition-colors border border-slate-300"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              tabIndex={0}
            >
              ?
            </button>
            {showTooltip && (
              <div className="absolute right-0 z-20 mt-2 w-64 bg-white text-slate-900 text-sm border border-slate-300 rounded-lg shadow-lg p-3" style={{ top: '2.5rem' }}>
                {config.helpText}
              </div>
            )}
          </div>
        )}
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
