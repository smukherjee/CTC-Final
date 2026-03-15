import { useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';
import { Link, useNavigate } from 'react-router-dom';
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
  freight_amount?: number;
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
  freight: number;
  loading_detention: number;
  unloading_charges: number;
  unloading_detention: number;
  other_charges: number;
}

function lineTotal(line: InvoiceLineDraft): number {
  return (
    Number(line.freight || 0) +
    Number(line.loading_detention || 0) +
    Number(line.unloading_charges || 0) +
    Number(line.unloading_detention || 0) +
    Number(line.other_charges || 0)
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InvoiceForm() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
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
  const [selectedLrIds, setSelectedLrIds] = useState<number[]>([]);
  const [lines, setLines] = useState<InvoiceLineDraft[]>([]);

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
    const selected = lrs.filter((lr) => selectedLrIds.includes(Number(lr.id)));
    setLines(
      selected.map((lr, index) => ({
        lr_id: Number(lr.id),
        s_no: index + 1,
        lr_no: String(lr.lr_number || ''),
        lr_date: String(lr.date || ''),
        v_type: String(lr.vehicle_type || ''),
        vehicle_no: String(lr.vehicle_number || ''),
        consignor: String(lr.consignor_name || ''),
        consignee: String(lr.consignee_name || ''),
        from_city: String(lr.origin || ''),
        to_city: String(lr.destination || ''),
        freight: Number(lr.freight_amount || 0),
        loading_detention: 0,
        unloading_charges: 0,
        unloading_detention: 0,
        other_charges: 0,
      })),
    );
  }, [selectedLrIds, lrs]);

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

  const toggleLr = (id: number) =>
    setSelectedLrIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const updateLine = (index: number, key: keyof InvoiceLineDraft, value: number) =>
    setLines((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, [key]: Number(value || 0) } : line)),
    );

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
        ...line,
        qty: 1,
        particulars: 'Transport Service',
        total: lineTotal(line),
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
    await apiClient.post('/api/billing/invoices/', buildPayload(values));
    navigate('/finance/invoices');
  });

  const onPrint = handleSubmit(async (values) => {
    if (!validateLines()) return;
    const res = await apiClient.post('/api/billing/invoices/', buildPayload(values));
    const invoice = res.data;
    printInvoice({
      invoice_no: invoice.invoice_no,
      invoice_date: invoice.invoice_date,
      po_no: invoice.po_no || '',
      po_date: invoice.po_date || '',
      hsn_code: invoice.hsn_code || '996791',
      client_name: selectedClient?.name || '',
      client_address: selectedClient?.address || '',
      client_gstin: selectedClient?.gstin || '',
      reverse_charge: Boolean(invoice.reverse_charge),
      gst_paid_by: invoice.gst_paid_by || '',
      total_amount: Number(invoice.total_amount || 0),
      tds_amount: Number(invoice.tds_amount || 0),
      net_amount: Number(invoice.net_amount || 0),
      lines: (invoice.lines || []).map((line: any) => ({
        s_no: line.s_no,
        lr_no: line.lr_no,
        lr_date: line.lr_date,
        qty: Number(line.qty || 0),
        particulars: line.particulars || 'Transport Service',
        v_type: line.v_type,
        vehicle_no: line.vehicle_no,
        consignor: line.consignor,
        consignee: line.consignee,
        from_city: line.from_city,
        to_city: line.to_city,
        freight: Number(line.freight || 0),
        loading_detention: Number(line.loading_detention || 0),
        unloading_charges: Number(line.unloading_charges || 0),
        unloading_detention: Number(line.unloading_detention || 0),
        other_charges: Number(line.other_charges || 0),
        total: Number(line.total || 0),
      })),
    });
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invoice Form</h2>
        <p className="text-sm text-slate-500">
          Create invoice from selected LRs and print using invoice template.
        </p>
        <Link to="/finance/invoices" className="mt-2 inline-block text-sm text-blue-700 hover:underline">
          Back to Invoice Register
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded border bg-white p-4 md:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">FY</label>
          <select {...register('financial_year')} className="w-full rounded border px-2 py-2">
            {fyOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Invoice Date</label>
          <input type="date" {...register('invoice_date')} className="w-full rounded border px-2 py-2" />
          {errors.invoice_date && (
            <p className="mt-1 text-xs text-red-600">{errors.invoice_date.message}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Client</label>
          <select {...register('client_id')} className="w-full rounded border px-2 py-2">
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
          <input {...register('po_no')} className="w-full rounded border px-2 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">PO Date</label>
          <input type="date" {...register('po_date')} className="w-full rounded border px-2 py-2" />
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Batch LR Selector</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {lrs.map((lr) => (
            <label key={lr.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedLrIds.includes(Number(lr.id))}
                onChange={() => toggleLr(Number(lr.id))}
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
              <th className="px-2 py-2 text-left">Freight</th>
              <th className="px-2 py-2 text-left">Load Det.</th>
              <th className="px-2 py-2 text-left">Unload Chg</th>
              <th className="px-2 py-2 text-left">Unload Det.</th>
              <th className="px-2 py-2 text-left">Other</th>
              <th className="px-2 py-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={line.lr_id} className="border-t">
                <td className="px-2 py-2">{line.lr_no}</td>
                <td className="px-2 py-2">{line.from_city}</td>
                <td className="px-2 py-2">{line.to_city}</td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={line.freight}
                    onChange={(e) => updateLine(idx, 'freight', Number(e.target.value))}
                    className="w-24 rounded border px-2 py-1"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={line.loading_detention}
                    onChange={(e) => updateLine(idx, 'loading_detention', Number(e.target.value))}
                    className="w-24 rounded border px-2 py-1"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={line.unloading_charges}
                    onChange={(e) => updateLine(idx, 'unloading_charges', Number(e.target.value))}
                    className="w-24 rounded border px-2 py-1"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={line.unloading_detention}
                    onChange={(e) => updateLine(idx, 'unloading_detention', Number(e.target.value))}
                    className="w-24 rounded border px-2 py-1"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={line.other_charges}
                    onChange={(e) => updateLine(idx, 'other_charges', Number(e.target.value))}
                    className="w-24 rounded border px-2 py-1"
                  />
                </td>
                <td className="px-2 py-2 font-semibold">{lineTotal(line).toFixed(2)}</td>
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
            className="w-28 rounded border px-2 py-1"
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
          disabled={isSubmitting}
          className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onPrint}
          disabled={isSubmitting}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Processing...' : 'Print'}
        </button>
        <Link to="/finance/invoices" className="rounded border px-4 py-2 text-sm">
          Cancel
        </Link>
      </div>
    </div>
  );
}
