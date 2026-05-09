import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';
import GenericReportView from '@/features/reports/GenericReportView';
import { REPORT_CONFIGS } from '@/features/reports/reportConfigs';

export default function Reports() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState(currentFy);
  const [searchParams] = useSearchParams();
  const defaultTab = REPORT_CONFIGS[0]?.id || 'pending-billing';
  const tab = searchParams.get('tab') || defaultTab;

  const selectedConfig = REPORT_CONFIGS.find((item) => item.id === tab) || REPORT_CONFIGS[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedConfig?.supportsFy !== false ? (
            <>
              <label htmlFor="reports_fy" className="text-sm font-medium text-slate-700">FY</label>
              <select
                id="reports_fy"
                value={fy}
                onChange={(e) => setFy(e.target.value)}
                className="rounded border px-3 py-2 text-sm bg-white"
              >
                {fyOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </>
          ) : (
            <span className="text-xs text-slate-500">This report does not use FY filter.</span>
          )}
        </div>
      </div>

      <div className="text-sm text-slate-600">{selectedConfig?.label}</div>

      {selectedConfig ? <GenericReportView config={selectedConfig} fy={fy} /> : null}
    </div>
  );
}
