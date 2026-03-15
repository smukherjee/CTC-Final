export interface GridValueFormatterParams {
  value: unknown;
}

export interface GridValueGetterParams {
  data: Record<string, unknown>;
}

export interface ReportConfig {
  id: string;
  label: string;
  endpoint: string;
  noRowsMessage: string;
  supportsFy?: boolean;
  params?: Record<string, string | number | boolean>;
  columns: Array<{
    field?: string;
    headerName: string;
    minWidth?: number;
    flex?: number;
    valueFormatter?: (params: GridValueFormatterParams) => string;
    valueGetter?: (params: GridValueGetterParams) => string | number;
    cellStyle?: Record<string, string | number>;
    currencyTotal?: boolean;
  }>;
}
