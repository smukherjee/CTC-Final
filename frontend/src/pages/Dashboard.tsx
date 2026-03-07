import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { formatDisplayDate, formatDisplayDateTime } from '@/utils/dateFormat';

interface EwayExpiringRow {
  id: number;
  lr_number?: string;
  date?: string;
  vehicle_number?: string;
  consignor_name?: string;
  consignee_name?: string;
  eway_bill_no?: string;
  origin?: string;
  destination?: string;
  eway_bill_expiry?: string | null;
}

interface ContractExpiringRow {
  id: number;
  name: string;
  end_date?: string | null;
  days_remaining?: number;
}

export default function Dashboard() {
  const [rows, setRows] = useState<EwayExpiringRow[]>([]);
  const [contractRows, setContractRows] = useState<ContractExpiringRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [dismissedContractIds, setDismissedContractIds] = useState<number[]>([]);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/lr/eway-expiring', {
        params: { months: 3 },
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load E-way expiry alerts', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContractAlerts = useCallback(async () => {
    try {
      const res = await axios.get('/api/contracts/expiring', {
        params: { days: 30 },
      });
      setContractRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load contract expiry alerts', err);
      setContractRows([]);
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
    void loadContractAlerts();
    const timer = window.setInterval(() => {
      void loadAlerts();
      void loadContractAlerts();
    }, 5 * 60 * 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [loadAlerts, loadContractAlerts]);

  const visibleRows = useMemo(
    () => rows.filter((row) => !dismissedIds.includes(Number(row.id))),
    [rows, dismissedIds],
  );

  const dismiss = (id: number) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const visibleContractRows = useMemo(
    () => contractRows.filter((row) => !dismissedContractIds.includes(Number(row.id))),
    [contractRows, dismissedContractIds],
  );

  const dismissContract = (id: number) => {
    setDismissedContractIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          E-way bill alerts (next 3 months, POD pending)
        </p>
      </div>

      {loading && (
        <div className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-600">
          Loading alerts...
        </div>
      )}

      {!loading && visibleRows.length === 0 && (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          No E-way bills expiring in the next 3 months.
        </div>
      )}

      {!loading &&
        visibleRows.map((row) => (
          <div key={row.id} className="flex items-start justify-between gap-4 rounded border border-amber-200 bg-amber-50 p-3">
            <div className="text-sm text-amber-900">
              <div className="font-semibold">LR {row.lr_number || row.id}</div>
              <div>
                Date: {formatDisplayDate(row.date)} | E-way: {row.eway_bill_no || '-'}
              </div>
              <div>
                {row.consignor_name || '-'} to {row.consignee_name || '-'}
              </div>
              <div>
                {row.origin || '-'} to {row.destination || '-'} | Vehicle: {row.vehicle_number || '-'}
              </div>
              <div>Expiry: {formatDisplayDateTime(row.eway_bill_expiry)}</div>
              <a
                href={`/operations/lr/${row.id}`}
                className="mt-1 inline-block text-xs font-medium text-amber-900 underline"
              >
                Open LR / Extend E-way
              </a>
            </div>
            <button
              type="button"
              onClick={() => dismiss(Number(row.id))}
              className="rounded bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200"
            >
              Dismiss
            </button>
          </div>
        ))}

      {visibleContractRows.map((row) => (
        <div key={`contract-${row.id}`} className="flex items-start justify-between gap-4 rounded border border-rose-200 bg-rose-50 p-3">
          <div className="text-sm text-rose-900">
            <div className="font-semibold">Contract expiry: {row.name}</div>
            <div>
              End Date: {formatDisplayDate(row.end_date)} | Days Remaining: {row.days_remaining ?? '-'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => dismissContract(Number(row.id))}
            className="rounded bg-rose-100 px-3 py-1 text-xs font-medium text-rose-900 hover:bg-rose-200"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
