import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { EMPTY_FORM_OPTIONS, fetchFormOptions, type FormOptions } from '@/config/formOptions';
import { printHireMemo } from '@/utils/printHireMemo';
import FileUpload from '@/components/FileUpload';

export interface HireMemo {
  id: number;
  lr_id: number;
  hire_memo_no?: string;
  hire_memo_date?: string;
  branch?: string;
  vehicle_id?: number;
  vehicle_number?: string;
  driver_name?: string;
  driver_mobile?: string;
  driver_license?: string;
  from_location?: string;
  to_location?: string;
  payment_location?: string;
  rate_type?: string;
  freight_rate?: number;
  freight_weight?: number;
  guaranteed_weight?: number;
  total_amount: number;
  advance_cash?: number;
  advance_bank?: number;
  balance?: number;
  commission?: number;
  hamali?: number;
  mamul?: number;
  other_deductions?: number;
  ack_status?: string;
  notes?: string;
}

export default function HireMemo() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryLrId = searchParams.get('lr_id');
  const activeLrId = queryLrId && queryLrId !== 'undefined' && !isNaN(parseInt(queryLrId, 10))
    ? parseInt(queryLrId, 10)
    : undefined;

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingMemoId, setExistingMemoId] = useState<number | undefined>(undefined);
  const [formOptions, setFormOptions] = useState<FormOptions>(EMPTY_FORM_OPTIONS);
  const [linkedLrNumber, setLinkedLrNumber] = useState<string>('');
  const [linkedLrDate, setLinkedLrDate] = useState<string>('');
  const [linkedArticlesCount, setLinkedArticlesCount] = useState<number | undefined>(undefined);
  const [form, setForm] = useState<Partial<HireMemo>>({
    lr_id: activeLrId,
    hire_memo_date: format(new Date(), 'yyyy-MM-dd'),
    commission: 0,
    hamali: 0,
    mamul: 0,
    other_deductions: 0,
    advance_cash: 0,
    advance_bank: 0,
  });

  const canSave = useMemo(() => Boolean(activeLrId), [activeLrId]);

  useEffect(() => {
    let mounted = true;
    fetchFormOptions()
      .then((options) => {
        if (!mounted) return;
        setFormOptions(options);
        setForm((prev) => ({
          ...prev,
          ack_status: prev.ack_status || options.defaults.hirememo_ack_status,
          rate_type: prev.rate_type || options.defaults.hirememo_rate_type,
        }));
      })
      .catch(() => {
        if (!mounted) return;
        setFormOptions(EMPTY_FORM_OPTIONS);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!activeLrId) {
      // reset states asynchronously to avoid cascading synchronous renders
      setTimeout(() => {
        setExistingMemoId(undefined);
        setLinkedLrNumber('');
        setLinkedLrDate('');
        setLinkedArticlesCount(undefined);
        setForm((prev) => ({ ...prev, lr_id: undefined }));
      }, 0);

      return;
    }

    let mounted = true;
    // defer setting loading to avoid synchronous setState inside effect
    setTimeout(() => { if (mounted) setLoading(true); }, 0);

    Promise.all([
      axios.get(`/api/lr/${activeLrId}`).catch(() => ({ data: null })),
      axios.get('/api/hirememo/', { params: { lr_id: activeLrId } }).catch(() => ({ data: [] })),
    ])
      .then(([lrRes, hmRes]) => {
        if (!mounted) return;
        const lr = lrRes.data;
        const memos: HireMemo[] = Array.isArray(hmRes.data) ? hmRes.data : [];
        const existing = memos[0];

        setLinkedLrNumber(lr?.lr_number || '');
        setLinkedLrDate(lr?.date || '');
        setLinkedArticlesCount(
          Number.isFinite(Number(lr?.articles_count)) ? Number(lr.articles_count) : undefined,
        );
        setExistingMemoId(existing?.id);

        if (existing) {
          setForm({
            ...existing,
            lr_id: activeLrId,
            hire_memo_date: existing.hire_memo_date || format(new Date(), 'yyyy-MM-dd'),
          });
        } else {
          setForm((prev) => ({
            ...prev,
            lr_id: activeLrId,
            hire_memo_date: format(new Date(), 'yyyy-MM-dd'),
            vehicle_number: lr?.vehicle_number || '',
            vehicle_id: lr?.vehicle_id,
            driver_name: lr?.driver_name || '',
            driver_mobile: lr?.driver_mobile || '',
            from_location: lr?.origin || '',
            to_location: lr?.destination || '',
            freight_weight: lr?.weight ? Number(lr.weight) / 1000 : 0,
          }));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [activeLrId]);

  function updateField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeLrId) {
      alert('No valid LR selected. Open Hire Memo from Dispatch Register.');
      return;
    }

    const payload = {
      ...form,
      lr_id: activeLrId,
      total_amount: Number(form.total_amount || 0),
      advance_cash: Number(form.advance_cash || 0),
      advance_bank: Number(form.advance_bank || 0),
      freight_rate: form.freight_rate ? Number(form.freight_rate) : null,
      freight_weight: form.freight_weight ? Number(form.freight_weight) : null,
      guaranteed_weight: form.guaranteed_weight ? Number(form.guaranteed_weight) : null,
      commission: Number(form.commission || 0),
      hamali: Number(form.hamali || 0),
      mamul: Number(form.mamul || 0),
      other_deductions: Number(form.other_deductions || 0),
      vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
    };

    setIsSaving(true);
    const request = existingMemoId
      ? axios.put(`/api/hirememo/${existingMemoId}`, payload)
      : axios.post('/api/hirememo/', payload);

    request
      .then((r) => {
        setExistingMemoId(r.data?.id || existingMemoId);
        alert(existingMemoId ? 'Hire Memo Updated!' : 'Hire Memo Created!');
        navigate('/operations/dispatch');
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to save hire memo: ' + (err.response?.data?.detail || err.message));
      })
      .finally(() => setIsSaving(false));
  }

  function handlePrint() {
    printHireMemo({
      ...form,
      lr_number: linkedLrNumber,
      lr_date: linkedLrDate,
      articles_count: linkedArticlesCount,
      total_amount: Number(form.total_amount || 0),
      advance_cash: Number(form.advance_cash || 0),
      advance_bank: Number(form.advance_bank || 0),
      balance: Number(form.balance || 0),
      freight_weight: form.freight_weight,
      other_deductions: form.other_deductions,
      notes: form.notes,
    });
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {existingMemoId ? 'Edit Hire Memo' : 'Create Hire Memo'}
        </h2>
        <div className="text-sm text-slate-600">
          Linked LR No: <span className="font-semibold">{linkedLrNumber || '-'}</span>
        </div>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded shadow">
        <div className="col-span-1">
          <label className="block text-sm font-medium">HM No (Auto)</label>
          <input value={form.hire_memo_no || 'Auto on Save'} readOnly className="w-full border p-2 rounded bg-slate-50" />
        </div>
        <div className="col-span-1">
          <label htmlFor="hire_memo_date" className="block text-sm font-medium">Date</label>
          <input id="hire_memo_date" type="date" name="hire_memo_date" value={form.hire_memo_date || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Financial Year</label>
          <input value={(form as any).financial_year || 'Auto'} readOnly className="w-full border p-2 rounded bg-slate-50" />
        </div>

        <div className="col-span-1">
          <label htmlFor="branch" className="block text-sm font-medium">Branch</label>
          <input id="branch" name="branch" value={form.branch || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-1">
          <label htmlFor="vehicle_number" className="block text-sm font-medium">Vehicle No</label>
          <input id="vehicle_number" name="vehicle_number" value={form.vehicle_number || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label htmlFor="driver_name" className="block text-sm font-medium">Driver Name</label>
          <input id="driver_name" name="driver_name" value={form.driver_name || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label htmlFor="driver_mobile" className="block text-sm font-medium">Driver Mobile</label>
          <input id="driver_mobile" name="driver_mobile" value={form.driver_mobile || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-1">
          <label htmlFor="from_location" className="block text-sm font-medium">From</label>
          <input id="from_location" name="from_location" value={form.from_location || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label htmlFor="to_location" className="block text-sm font-medium">To</label>
          <input id="to_location" name="to_location" value={form.to_location || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label htmlFor="payment_location" className="block text-sm font-medium">Payment At</label>
          <input id="payment_location" name="payment_location" value={form.payment_location || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-1">
          <label htmlFor="rate_type" className="block text-sm font-medium">Rate Type</label>
          <select id="rate_type" name="rate_type" value={form.rate_type || ''} onChange={updateField} className="w-full border p-2 rounded">
            <option value="">Select Rate Type</option>
            {formOptions.hirememo_rate_types.map((rateType) => (
              <option key={rateType} value={rateType}>{rateType}</option>
            ))}
          </select>
        </div>
        <div className="col-span-1">
          <label htmlFor="freight_rate" className="block text-sm font-medium">Rate</label>
          <input id="freight_rate" type="number" name="freight_rate" value={form.freight_rate || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label htmlFor="freight_weight" className="block text-sm font-medium">Weight (MT)</label>
          <input id="freight_weight" type="number" name="freight_weight" value={form.freight_weight || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-1">
          <label htmlFor="total_amount" className="block text-sm font-bold text-blue-600">Total Amount</label>
          <input id="total_amount" type="number" name="total_amount" value={form.total_amount || ''} onChange={updateField} className="w-full border p-2 rounded font-bold" />
        </div>
        <div className="col-span-1">
          <label htmlFor="advance_cash" className="block text-sm font-medium">Advance Cash</label>
          <input id="advance_cash" type="number" name="advance_cash" value={form.advance_cash || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label htmlFor="advance_bank" className="block text-sm font-medium">Advance Bank</label>
          <input id="advance_bank" type="number" name="advance_bank" value={form.advance_bank || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-1">
          <label htmlFor="commission" className="block text-sm font-medium">Commission</label>
          <input id="commission" type="number" name="commission" value={form.commission || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label htmlFor="hamali" className="block text-sm font-medium">Hamali</label>
          <input id="hamali" type="number" name="hamali" value={form.hamali || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label htmlFor="mamul" className="block text-sm font-medium">Mamul</label>
          <input id="mamul" type="number" name="mamul" value={form.mamul || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-3">
          <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
          <textarea id="notes" name="notes" value={form.notes || ''} onChange={updateField} className="w-full border p-2 rounded" rows={3} />
        </div>

        <div className="col-span-3 border-t border-slate-200 pt-4">
          <FileUpload
            title="Hire Memo Related Uploads"
            lrId={activeLrId}
            hirememoId={existingMemoId}
            allowedDocumentTypes={['INVOICE', 'POD', 'EWAY_BILL']}
          />
        </div>

        <div className="col-span-3 mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => navigate('/operations/dispatch')} className="px-4 py-2 border rounded">Cancel</button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!canSave}
            className="px-4 py-2 border rounded bg-white disabled:opacity-60"
          >
            Print
          </button>
          <button
            type="submit"
            disabled={!canSave || loading || isSaving}
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : existingMemoId ? 'Update Hire Memo' : 'Save Hire Memo'}
          </button>
        </div>
      </form>
    </div>
  );
}
