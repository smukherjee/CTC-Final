/**
 * Financial year utilities for CTC-ERP frontend.
 * FY format: 'YYYY-YY'  e.g. '2025-26'
 */

/**
 * Return the current financial year string based on today's date.
 */
export function getCurrentFy(): string {
  return fyFromDate(new Date());
}

/**
 * Return financial year string for a given date.
 * FY starts April 1.
 * e.g. Jan 15 2026 → '2025-26',  Apr 1 2026 → '2026-27'
 */
export function fyFromDate(d: Date): string {
  const month = d.getMonth() + 1; // 1-based
  const year = d.getFullYear();
  const start = month >= 4 ? year : year - 1;
  const end = (start + 1) % 100;
  return `${start}-${String(end).padStart(2, '0')}`;
}

/**
 * Return FY dropdown options with current FY first plus prior years.
 * Default: current FY + 3 prior FYs.
 * Example: ['2025-26', '2024-25', '2023-24', '2022-23']
 */
export function generateFyDropdownOptions(baseFy: string = getCurrentFy(), years: number = 4): string[] {
  const startYear = Number(baseFy.slice(0, 4));
  if (!Number.isFinite(startYear)) return [getCurrentFy()];

  const options: string[] = [];
  for (let i = 0; i < years; i += 1) {
    const start = startYear - i;
    const end = (start + 1) % 100;
    options.push(`${start}-${String(end).padStart(2, '0')}`);
  }
  return options;
}
