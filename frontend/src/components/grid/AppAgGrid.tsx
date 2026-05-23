import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

type CurrencyTotalMode = 'sum' | 'last';

interface CurrencyTotalColumnDef {
  field?: string;
  cellRenderer?: any;
  currencyTotal?: boolean;
  currencyTotalMode?: CurrencyTotalMode;
}

interface AppAgGridProps<T> {
  rowData: T[];
  columnDefs: any[];
  defaultColDef?: any;
  getRowId?: any;
  getRowClass?: any;
  onCellValueChanged?: any;
  onFirstDataRendered?: any;
  editType?: 'fullRow' | undefined;
  paginationPageSize?: number;
  loading?: boolean;
  className?: string;
  rowSelection?: any;
  animateRows?: boolean;
  groupDisplayType?: any;
  multiSortKey?: 'ctrl' | undefined;
  enableCellTextSelection?: boolean;
  ensureDomOrder?: boolean;
  stopEditingWhenCellsLoseFocus?: boolean;
  paginationPageSizeSelector?: number[];
  fitColumns?: boolean;
  alwaysShowHorizontalScroll?: boolean;
  pagination?: boolean;
  noRowsMessage?: string;
  showCurrencyTotals?: boolean;
  currencyTotalLabel?: string;
  currencyTotalLabelField?: string;
  showExportCsv?: boolean;
  exportFileName?: string;
  suppressClickEdit?: boolean;
  domLayout?: 'normal' | 'autoHeight' | 'print';
}

function escapeOverlayText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function slugifyFileNamePart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'ag-grid-export';
}

function defaultExportFileName(): string {
  if (typeof window === 'undefined') {
    return 'ag-grid-export.csv';
  }

  const pathPart = window.location.pathname.split('/').filter(Boolean).join('-') || 'ag-grid-export';
  const datePart = new Date().toISOString().slice(0, 10);
  return `${slugifyFileNamePart(pathPart)}-${datePart}.csv`;
}

export default function AppAgGrid<T>({
  rowData,
  columnDefs,
  defaultColDef,
  getRowId,
  getRowClass,
  onCellValueChanged,
  onFirstDataRendered,
  editType = 'fullRow',
  paginationPageSize = 20,
  loading = false,
  className,
  rowSelection,
  animateRows = true,
  groupDisplayType = 'groupRows',
  multiSortKey = 'ctrl',
  enableCellTextSelection = true,
  ensureDomOrder = true,
  stopEditingWhenCellsLoseFocus = true,
  paginationPageSizeSelector = [10, 20, 50, 100],
  fitColumns = false,
  alwaysShowHorizontalScroll = true,
  pagination = true,
  noRowsMessage,
  showCurrencyTotals = false,
  currencyTotalLabel = 'Total',
  currencyTotalLabelField,
  showExportCsv = true,
  exportFileName,
  suppressClickEdit = false,
  domLayout = 'normal',
}: AppAgGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<AgGridReact<T>>(null);
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState<T[] | undefined>(undefined);

  useEffect(() => {
    if (!fitColumns) return;
    if (!containerRef.current || !gridRef.current) return;
    const observer = new ResizeObserver(() => {
      gridRef.current?.api?.sizeColumnsToFit();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fitColumns]);

  const mergedRowSelection = useMemo(
    () => ({
      mode: 'singleRow',
      enableClickSelection: false,
      checkboxes: false,
      headerCheckbox: false,
      ...(rowSelection || {}),
    }),
    [rowSelection],
  );

  const mergedDefaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: false,
      unSortIcon: true,
      sortingOrder: ['asc', 'desc', null] as const,
      ...(defaultColDef || {}),
    }),
    [defaultColDef],
  );

  const overlayNoRowsTemplate = useMemo(() => {
    if (!noRowsMessage?.trim()) return undefined;
    const safeMessage = escapeOverlayText(noRowsMessage.trim());
    return `<div class="ag-overlay-no-rows-center"><span>${safeMessage}</span></div>`;
  }, [noRowsMessage]);

  const processedColumnDefs = useMemo<any[]>(
    () => columnDefs.map((columnDef: CurrencyTotalColumnDef) => {
      const { currencyTotal, currencyTotalMode, ...gridColumnDef } = columnDef || {};
      if (!gridColumnDef?.cellRenderer) return gridColumnDef;
      const originalCellRenderer = gridColumnDef.cellRenderer;
      return {
        ...gridColumnDef,
        cellRenderer: (params: any) => {
          if (params.node?.rowPinned) {
            return params.valueFormatted ?? params.value ?? '';
          }
          return originalCellRenderer(params);
        },
      };
    }),
    [columnDefs],
  );

  const totalColumnDefs = useMemo(
    () => columnDefs.filter(
      (columnDef: CurrencyTotalColumnDef) => columnDef?.currencyTotal && typeof columnDef.field === 'string',
    ),
    [columnDefs],
  );

  const recalculateTotals = useCallback((api: any) => {
    if (!showCurrencyTotals || totalColumnDefs.length === 0) {
      setPinnedBottomRowData(undefined);
      return;
    }

    const visibleRows: any[] = [];
    api.forEachNodeAfterFilterAndSort((node: any) => {
      if (node?.rowPinned || node?.group || !node?.data) return;
      visibleRows.push(node.data);
    });

    if (visibleRows.length === 0) {
      setPinnedBottomRowData(undefined);
      return;
    }

    const totalRow: Record<string, unknown> = {};
    if (currencyTotalLabelField) {
      totalRow[currencyTotalLabelField] = currencyTotalLabel;
    }

    totalColumnDefs.forEach((columnDef: CurrencyTotalColumnDef) => {
      const field = columnDef.field;
      if (!field) return;

      if (columnDef.currencyTotalMode === 'last') {
        const lastRow = [...visibleRows].reverse().find((row) => Number.isFinite(Number(row?.[field])));
        totalRow[field] = lastRow ? Number(lastRow[field] || 0) : 0;
        return;
      }

      totalRow[field] = visibleRows.reduce((sum, row) => {
        const value = Number(row?.[field] || 0);
        return Number.isFinite(value) ? sum + value : sum;
      }, 0);
    });

    setPinnedBottomRowData([totalRow as T]);
  }, [currencyTotalLabel, currencyTotalLabelField, showCurrencyTotals, totalColumnDefs]);

  useEffect(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    recalculateTotals(api);
  }, [recalculateTotals, rowData]);

  const resolvedExportFileName = useMemo(
    () => exportFileName || defaultExportFileName(),
    [exportFileName],
  );

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api?.exportDataAsCsv({
      fileName: resolvedExportFileName,
    });
  }, [resolvedExportFileName]);

  useEffect(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    if (loading) {
      api.hideOverlay();
      return;
    }
    if (rowData.length === 0 && overlayNoRowsTemplate) {
      api.showNoRowsOverlay();
      return;
    }
    api.hideOverlay();
  }, [loading, overlayNoRowsTemplate, rowData]);

  return (
    <div className="flex flex-col gap-2">
      {showExportCsv && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={loading || rowData.length === 0}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      )}
      <div ref={containerRef} className={`${domLayout === 'autoHeight' ? 'min-h-[100px]' : 'h-[500px] min-h-[500px] overflow-hidden'} rounded-lg border border-slate-200 ag-theme-alpine dispatch-grid ${className || ''}`}>
        <style>{`
        .eway-expiry-warning {
          background-color: #fef2f2 !important;
        }
        .eway-expiry-warning:hover {
          background-color: #fee2e2 !important;
        }
        .ag-cell-edit-wrapper {
          padding: 0 !important;
        }
        .dispatch-grid.ag-theme-alpine {
          --ag-font-size: 14px;
          --ag-header-font-size: 13px;
          --ag-row-height: 48px;
          --ag-header-height: 46px;
        }
        .dispatch-grid .ag-header-cell-text {
          font-weight: 700;
          letter-spacing: 0.2px;
          color: #1e293b;
        }
        .dispatch-grid .ag-cell {
          color: #0f172a;
          line-height: 1.45;
        }
        .dispatch-grid .ag-paging-panel {
          font-size: 13px;
          color: #334155;
        }
        .dispatch-grid .ag-row-pinned {
          background: #f8fafc;
          border-top: 1px solid #cbd5e1;
          font-weight: 700;
        }
        `}</style>
        <AgGridReact<T>
          ref={gridRef}
          theme="legacy"
          rowData={rowData}
          columnDefs={processedColumnDefs}
          defaultColDef={mergedDefaultColDef}
          getRowId={getRowId}
          getRowClass={getRowClass}
          editType={editType}
          stopEditingWhenCellsLoseFocus={stopEditingWhenCellsLoseFocus}
          onCellValueChanged={onCellValueChanged}
          animateRows={animateRows}
          enableCellTextSelection={enableCellTextSelection}
          ensureDomOrder={ensureDomOrder}
          suppressClickEdit={suppressClickEdit}
          domLayout={domLayout}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={pagination ? paginationPageSizeSelector : undefined}
          alwaysShowHorizontalScroll={alwaysShowHorizontalScroll}
          rowSelection={mergedRowSelection}
          groupDisplayType={groupDisplayType}
          multiSortKey={multiSortKey}
          overlayNoRowsTemplate={overlayNoRowsTemplate}
          pinnedBottomRowData={pinnedBottomRowData}
          onFirstDataRendered={(params) => {
            if (fitColumns) {
              params.api.sizeColumnsToFit();
            }
            if (!loading && rowData.length === 0 && overlayNoRowsTemplate) {
              params.api.showNoRowsOverlay();
            }
            recalculateTotals(params.api);
            onFirstDataRendered?.(params);
          }}
          onFilterChanged={(params) => recalculateTotals(params.api)}
          onSortChanged={(params) => recalculateTotals(params.api)}
          onModelUpdated={(params) => recalculateTotals(params.api)}
          onPaginationChanged={(params) => recalculateTotals(params.api)}
        />
      </div>
    </div>
  );
}
