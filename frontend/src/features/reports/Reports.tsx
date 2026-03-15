import { useState } from 'react';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';
import GenericReportView from '@/features/reports/GenericReportView';
import { REPORT_CONFIGS } from '@/features/reports/reportConfigs';

export default function Reports() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState(currentFy);
  const [tab, setTab] = useState<string>(REPORT_CONFIGS[0]?.id || 'pending-billing');

  const selectedConfig = REPORT_CONFIGS.find((item) => item.id === tab) || REPORT_CONFIGS[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h2>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <label htmlFor="reports_fy" className="text-sm font-medium text-slate-700">FY</label>
        <select
          id="reports_fy"
          value={fy}
          onChange={(e) => setFy(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          {fyOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {selectedConfig?.supportsFy === false ? (
          <span className="text-xs text-slate-500">This report does not use FY filter.</span>
        ) : null}
      </div>

      <div className="flex gap-2 flex-wrap">
        {REPORT_CONFIGS.map((config) => (
          <button
            key={config.id}
            type="button"
            onClick={() => setTab(config.id)}
            className={`rounded px-3 py-1 text-sm ${tab === config.id ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {selectedConfig ? <GenericReportView config={selectedConfig} fy={fy} /> : null}
    </div>
  );
}
