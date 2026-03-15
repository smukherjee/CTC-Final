import { useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { printInvoice } from '@/utils/printInvoice';

// ─── Zod schema ──────────────────────────────────────────────────────────────

const invoiceHeaderSchema = z.object({
  financial_year: z.string().min(1, 'Financial year is required'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  client_id: z.string().min(1, 'Client is required'),
  po_no: z.string().optional(),
  po_date: z.string().optional(),
  tds_amount: z.coerce.number().min(0, 'TDS must be ≥ 0'),
});

type InvoiceHeaderValues = z.infer<typeof invoiceHeaderSchema>;

// ─── Local types ─────────────────────────────────────────────────────────────

interface ClientItem {
  id: number;
  name: string;
  address?: string;
  gstin?: string;
}

interface LrItem {
  id: number;
  lr_number?: string;
  date?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  consignor_name?: string;
  consignee_name?: string;
  origin?: string;
  destination?: string;
  total?: number;
}

interface InvoiceLineDraft {
  lr_id: number;
  s_no: number;
  lr_no: string;
  lr_date: string;
  v_type: string;
  vehicle_no: string;
  consignor: string;
  consignee: string;
  from_city: string;
  to_city: string;
  line_amount: number;
}

function lineTotal(line: InvoiceLineDraft): number {
  return Number(line.line_amount || 0);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InvoiceForm() {
  const { invoiceId } = useParams();
  const invoiceIdNum = Number(invoiceId || 0);
  const isEditMode = Number.isFinite(invoiceIdNum) && invoiceIdNum > 0;
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceHeaderValues>({
    resolver: zodResolver(invoiceHeaderSchema) as Resolver<InvoiceHeaderValues>,
    defaultValues: {
      financial_year: currentFy,
      invoice_date: new Date().toISOString().slice(0, 10),
      client_id: '',
      po_no: '',
      po_date: '',
      tds_amount: 0,
    },
  });

  const watchedFy = watch('financial_year');
  const watchedClientId = watch('client_id');
  const watchedTds = watch('tds_amount');

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [lrs, setLrs] = useState<LrItem[]>([]);
  const [lines, setLines] = useState<InvoiceLineDraft[]>([]);
  const [invoiceStatus, setInvoiceStatus] = useState<string>('draft');
  const [loadingInvoice, setLoadingInvoice] = useState<boolean>(false);

  const isPaidInvoice = isEditMode && invoiceStatus === 'paid';

  useEffect(() => {
    apiClient.get('/api/clients/').then((res) => {
      const data = Array.isArray(res.data) ? res.data : [];
      setClients(
        data.map((client: any) => ({
          id: Number(client.id),
          name: String(client.name || client.client_name || `Client ${client.id}`),
          address: client.address || '',
          gstin: client.gstin || '',
        })),
      );
    });
  }, []);

  useEffect(() => {
    const params: any = { fy: watchedFy };
    if (watchedClientId) params.client_id = watchedClientId;
    apiClient
      .get('/api/lr/', { params })
      .then((res) => setLrs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLrs([]));
  }, [watchedFy, watchedClientId]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }
    let mounted = true;
    setLoadingInvoice(true);
    apiClient.get(`/api/billing/invoices/${invoiceIdNum}`)
      .then((res) => {
        if (!mounted) return;
        const invoice = res.data || {};
        const status = String(invoice.status || 'draft').toLowerCase();
        setInvoiceStatus(status);
        reset({
          financial_year: String(invoice.financial_year || currentFy),
          invoice_date: String(invoice.invoice_date || new Date().toISOString().slice(0, 10)),
          client_id: String(invoice.client_id || ''),
          po_no: String(invoice.po_no || ''),
          po_date: String(invoice.po_date || ''),
          tds_amount: Number(invoice.tds_amount || 0),
        });
        const existingLines = Array.isArray(invoice.lines) ? invoice.lines : [];
        setLines(
          existingLines.map((line: any, idx: number) => ({
            lr_id: Number(line.lr_id || 0),
            s_no: idx + 1,
            lr_no: String(line.lr_no || ''),
            lr_date: String(line.lr_date || ''),
            v_type: String(line.v_type || ''),
            vehicle_no: String(line.vehicle_no || ''),
            consignor: String(line.consignor || ''),
            consignee: String(line.consignee || ''),
            from_city: String(line.from_city || ''),
            to_city: String(line.to_city || ''),
            line_amount: Number(line.line_amount ?? line.total ?? 0),
          })),
        );
      })
      .finally(() => {
        if (mounted) setLoadingInvoice(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentFy, invoiceIdNum, isEditMode, reset]);

  const totalAmount = useMemo(
    () => lines.reduce((sum, line) => sum + lineTotal(line), 0),
    [lines],
  );
  const netAmount = useMemo(
    () => totalAmount - Number(watchedTds || 0),
    [totalAmount, watchedTds],
  );
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === Number(watchedClientId)),
    [clients, watchedClientId],
  );

  const selectedLrIds = useMemo(
    () => lines.map((line) => Number(line.lr_id)).filter((id) => Number.isFinite(id) && id > 0),
    [lines],
  );

  const selectableLrs = useMemo(() => {
    const byId = new Map<number, LrItem>();
    lrs.forEach((lr) => {
      const id = Number(lr.id);
      if (Number.isFinite(id) && id > 0) byId.set(id, lr);
    });
    lines.forEach((line) => {
      const id = Number(line.lr_id);
      if (!Number.isFinite(id) || id <= 0 || byId.has(id)) return;
      byId.set(id, {
        id,
        lr_number: line.lr_no,
        date: line.lr_date,
        vehicle_type: line.v_type,
        vehicle_number: line.vehicle_no,
        consignor_name: line.consignor,
        consignee_name: line.consignee,
        origin: line.from_city,
        destination: line.to_city,
        total: line.line_amount,
      });
    });
    return Array.from(byId.values());
  }, [lrs, lines]);

  const toggleLr = (id: number) => {
    if (isPaidInvoice) return;
    setLines((prev) => {
      const exists = prev.some((line) => Number(line.lr_id) === id);
      if (exists) {
        return prev
          .filter((line) => Number(line.lr_id) !== id)
          .map((line, index) => ({ ...line, s_no: index + 1 }));
      }
      const lr = lrs.find((item) => Number(item.id) === id);
      if (!lr) return prev;
      const next = [...prev, {
        lr_id: Number(lr.id),
        s_no: prev.length + 1,
        lr_no: String(lr.lr_number || ''),
        lr_date: String(lr.date || ''),
        v_type: String(lr.vehicle_type || ''),
        vehicle_no: String(lr.vehicle_number || ''),
        consignor: String(lr.consignor_name || ''),
        consignee: String(lr.consignee_name || ''),
        from_city: String(lr.origin || ''),
        to_city: String(lr.destination || ''),
        line_amount: Number(lr.total || 0),
      }];
      return next.map((line, index) => ({ ...line, s_no: index + 1 }));
    });
  };

  const removeLine = (index: number) => {
    if (isPaidInvoice) return;
    setLines((prev) => prev.filter((_, idx) => idx !== index).map((line, idx) => ({ ...line, s_no: idx + 1 })));
  };

  function buildPayload(values: InvoiceHeaderValues) {
    return {
      invoice_date: values.invoice_date,
      client_id: Number(values.client_id),
      financial_year: values.financial_year,
      po_no: values.po_no || null,
      po_date: values.po_date || null,
      total_amount: totalAmount,
      tds_amount: Number(values.tds_amount || 0),
      lines: lines.map((line) => ({
        lr_id: Number(line.lr_id),
        s_no: Number(line.s_no || 0),
      })),
    };
  }

  function validateLines(): boolean {
    if (lines.length === 0) {
      setError('client_id', { message: 'Select at least one LR to generate invoice lines' });
      return false;
    }
    return true;
  }

  const onSave = handleSubmit(async (values) => {
    if (!validateLines()) return;
    if (isEditMode) {
      await apiClient.put(`/api/billing/invoices/${invoiceIdNum}`, buildPayload(values));
    } else {
      await apiClient.post('/api/billing/invoices/', buildPayload(values));
    }
    navigate('/finance/invoices');
  });

  const onPrint = handleSubmit(async (values) => {
    if (!validateLines()) return;
    const savedRes = isEditMode
      ? await apiClient.put(`/api/billing/invoices/${invoiceIdNum}`, buildPayload(values))
      : await apiClient.post('/api/billing/invoices/', buildPayload(values));
    const invoiceId = Number(savedRes.data?.id);
    const printRes = await apiClient.get(`/api/billing/invoices/${invoiceId}/print-data`);
    const payload = printRes.data || {};
    const invoice = payload.invoice || {};
    printInvoice({
      invoice_no: invoice.invoice_no,
      invoice_date: invoice.invoice_date,
      po_no: invoice.po_no || '',
      po_date: invoice.po_date || '',
      hsn_code: invoice.hsn_code || '996791',
      client_name: selectedClient?.name || '',
      client_address: selectedClient?.address || '',
      client_gstin: selectedClient?.gstin || '',
      reverse_charge: Boolean(invoice.tax_on_reverse_charge ?? invoice.reverse_charge),
      gst_paid_by: invoice.gst_paid_by || '',
      total_amount: Number(invoice.total_amount || 0),
      tds_amount: Number(invoice.tds_amount || 0),
      net_amount: Number(invoice.net_amount || 0),
      less_lines: Array.isArray(payload.less_lines) ? payload.less_lines : [],
      lines: (invoice.lines || []).map((line: any) => ({
        s_no: line.s_no,
        lr_no: line.lr_no,
        lr_date: line.lr_date,
        qty: Number(line.qty || 1),
        particulars: line.particulars || 'Transport Service',
        v_type: line.v_type,
        vehicle_no: line.vehicle_no,
        consignor: line.consignor,
        consignee: line.consignee,
        from_city: line.from_city,
        to_city: line.to_city,
        freight: Number(line.total || 0),
        loading_detention: 0,
        unloading_charges: 0,
        unloading_detention: 0,
        other_charges: 0,
        total: Number(line.total || 0),
      })),
    });
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEditMode ? `Edit Invoice #${invoiceIdNum}` : 'Invoice Form'}
        </h2>
        <p className="text-sm text-slate-500">
          {isEditMode
            ? 'Update invoice lines, add missing LRs, or remove existing LRs before payment closure.'
            : 'Create invoice from selected LRs and print using invoice template.'}
        </p>
        <Link to="/finance/invoices" className="mt-2 inline-block text-sm text-blue-700 hover:underline">
          Back to Invoice Register
        </Link>
      </div>

      {loadingInvoice && (
        <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          Loading invoice details...
        </div>
      )}

      {isPaidInvoice && (
        <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This invoice is marked as paid and cannot be edited.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 rounded border bg-white p-4 md:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">FY</label>
          <select {...register('financial_year')} disabled={isPaidInvoice} className="w-full rounded border px-2 py-2 disabled:bg-slate-100">
            {fyOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Invoice Date</label>
          <input type="date" {...register('invoice_date')} disabled={isPaidInvoice} className="w-full rounded border px-2 py-2 disabled:bg-slate-100" />
          {errors.invoice_date && (
            <p className="mt-1 text-xs text-red-600">{errors.invoice_date.message}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Client</label>
          <select {...register('client_id')} disabled={isEditMode || isPaidInvoice} className="w-full rounded border px-2 py-2 disabled:bg-slate-100">
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          {errors.client_id && (
            <p className="mt-1 text-xs text-red-600">{errors.client_id.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">PO No</label>
          <input {...register('po_no')} disabled={isPaidInvoice} className="w-full rounded border px-2 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">PO Date</label>
          <input type="date" {...register('po_date')} disabled={isPaidInvoice} className="w-full rounded border px-2 py-2 disabled:bg-slate-100" />
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Batch LR Selector</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {selectableLrs.map((lr) => (
            <label key={lr.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedLrIds.includes(Number(lr.id))}
                onChange={() => toggleLr(Number(lr.id))}
                disabled={isPaidInvoice}
              />
              <span>
                {lr.lr_number || `LR ${lr.id}`} | {lr.origin || '-'} to {lr.destination || '-'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="overflow-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-2 py-2 text-left">LR</th>
              <th className="px-2 py-2 text-left">From</th>
              <th className="px-2 py-2 text-left">To</th>
              <th className="px-2 py-2 text-left">Line Amount (LR Total)</th>
              <th className="px-2 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={line.lr_id} className="border-t">
                <td className="px-2 py-2">{line.lr_no}</td>
                <td className="px-2 py-2">{line.from_city}</td>
                <td className="px-2 py-2">{line.to_city}</td>
                <td className="px-2 py-2 font-semibold">{lineTotal(line).toFixed(2)}</td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    disabled={isPaidInvoice}
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove LR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-4 rounded border bg-white p-4">
        <div className="text-sm">
          Total: <span className="font-semibold">{totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>TDS:</span>
          <input
            type="number"
            {...register('tds_amount')}
            disabled={isPaidInvoice}
            className="w-28 rounded border px-2 py-1 disabled:bg-slate-100"
          />
          {errors.tds_amount && (
            <span className="text-xs text-red-600">{errors.tds_amount.message}</span>
          )}
        </div>
        <div className="text-sm">
          Net: <span className="font-semibold">{netAmount.toFixed(2)}</span>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSubmitting || isPaidInvoice || loadingInvoice}
          className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onPrint}
          disabled={isSubmitting || isPaidInvoice || loadingInvoice}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Processing...' : isEditMode ? 'Update & Print' : 'Print'}
        </button>
        <Link to="/finance/invoices" className="rounded border px-4 py-2 text-sm">
          Cancel
        </Link>
      </div>
    </div>
  );
}
