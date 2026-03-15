import apiClient from './apiClient';

type QueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryValue>;

function cleanParams(params: QueryParams = {}): Record<string, string | number | boolean> {
  const normalized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }
    normalized[key] = value;
  }
  return normalized;
}

export async function fetchReportRows<T>(reportPath: string, params: QueryParams = {}): Promise<T[]> {
  const response = await apiClient.get(`/api/reports/${reportPath}`, {
    params: cleanParams(params),
  });
  return Array.isArray(response.data) ? (response.data as T[]) : [];
}

export async function fetchApiRows<T>(path: string, params: QueryParams = {}): Promise<T[]> {
  const response = await apiClient.get(path, {
    params: cleanParams(params),
  });
  return Array.isArray(response.data) ? (response.data as T[]) : [];
}
