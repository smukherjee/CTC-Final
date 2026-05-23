import { format, isValid, parseISO } from 'date-fns';

function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  const parsed = parseISO(String(value));
  if (isValid(parsed)) return parsed;

  const fallback = new Date(String(value));
  return isValid(fallback) ? fallback : null;
}

export function formatDisplayDate(value?: string | Date | null, fallback = '-'): string {
  const parsed = toDate(value);
  return parsed ? format(parsed, 'dd/MM/yyyy') : fallback;
}

export function formatDisplayDateTime(value?: string | Date | null, fallback = '-'): string {
  const parsed = toDate(value);
  return parsed ? format(parsed, 'dd/MM/yyyy HH:mm') : fallback;
}
