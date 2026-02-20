import { useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

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
  rowSelection = {
    mode: 'singleRow',
    enableClickSelection: false,
    checkboxes: false,
  },
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
}: AppAgGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<AgGridReact<T>>(null);

  useEffect(() => {
    if (!fitColumns) return;
    if (!containerRef.current || !gridRef.current) return;
    const observer = new ResizeObserver(() => {
      gridRef.current?.api?.sizeColumnsToFit();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fitColumns]);

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

  return (
    <div ref={containerRef} className={`flex-1 min-h-[500px] rounded-lg overflow-hidden border border-slate-200 ag-theme-alpine dispatch-grid ${className || ''}`}>
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
          --ag-font-size: 12px;
          --ag-header-font-size: 11px;
          --ag-row-height: 42px;
          --ag-header-height: 42px;
        }
        .dispatch-grid .ag-header-cell-text {
          font-weight: 700;
          letter-spacing: 0.2px;
        }
      `}</style>
      <AgGridReact<T>
        ref={gridRef}
        theme="legacy"
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={mergedDefaultColDef}
        getRowId={getRowId}
        getRowClass={getRowClass}
        editType={editType}
        loading={loading}
        stopEditingWhenCellsLoseFocus={stopEditingWhenCellsLoseFocus}
        onCellValueChanged={onCellValueChanged}
        animateRows={animateRows}
        enableCellTextSelection={enableCellTextSelection}
        ensureDomOrder={ensureDomOrder}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={pagination ? paginationPageSizeSelector : undefined}
        alwaysShowHorizontalScroll={alwaysShowHorizontalScroll}
        rowSelection={rowSelection}
        groupDisplayType={groupDisplayType}
        multiSortKey={multiSortKey}
        onFirstDataRendered={(params) => {
          if (fitColumns) {
            params.api.sizeColumnsToFit();
          }
          onFirstDataRendered?.(params);
        }}
      />
    </div>
  );
}
