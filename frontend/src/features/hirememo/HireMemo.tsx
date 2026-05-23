import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import apiClient from '@/lib/apiClient';
import { EMPTY_FORM_OPTIONS, fetchFormOptions } from '@/config/formOptions';
import { printHireMemo } from '@/utils/printHireMemo';
import FileUpload from '@/components/FileUpload';
import { useState } from 'react';

// ─── Zod schema ──────────────────────────────────────────────────────────────

const hireMemoSchema = z
  .object({
    hire_memo_date: z.string().min(1, 'Date is required'),
    branch: z.string().optional(),
    vehicle_number: z.string().optional(),
    driver_name: z.string().optional(),
    driver_mobile: z.string().optional(),
    driver_license: z.string().optional(),
    from_location: z.string().optional(),
    to_location: z.string().optional(),
    payment_location: z.string().optional(),
    rate_type: z.string().optional(),
    freight_rate: z.coerce.number().min(0, 'Must be ≥ 0').optional().nullable(),
    freight_weight: z.coerce.number().min(0, 'Must be ≥ 0').optional().nullable(),
    guaranteed_weight: z.coerce.number().min(0, 'Must be ≥ 0').optional().nullable(),
    total_amount: z.coerce.number().min(0, 'Total amount must be ≥ 0'),
    advance_cash: z.coerce.number().min(0, 'Must be ≥ 0').default(0),
    advance_bank: z.coerce.number().min(0, 'Must be ≥ 0').default(0),
    advance_payment_date: z.string().optional(),
    balance_payment_date: z.string().optional(),
    commission: z.coerce.number().min(0, 'Must be ≥ 0').default(0),
    other_deductions: z.coerce.number().min(0, 'Must be ≥ 0').default(0),
    ack_status: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (d) =>
      (Number(d.advance_cash) || 0) + (Number(d.advance_bank) || 0) <=
      (Number(d.total_amount) || 0),
    {
      message: 'Advances cannot exceed total amount',
      path: ['advance_cash'],
    },
  );

type HireMemoValues = z.infer<typeof hireMemoSchema>;

// ─── Exported interface (used by HireMemoRegister) ───────────────────────────

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
  advance_payment_date?: string;
  balance?: number;
  balance_payment_date?: string;
  commission?: number;
  hamali?: number;
  other_deductions?: number;
  ack_status?: string;
  notes?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HireMemoForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryLrId = searchParams.get('lr_id');
  const activeLrId =
    queryLrId && queryLrId !== 'undefined' && !isNaN(parseInt(queryLrId, 10))
      ? parseInt(queryLrId, 10)
      : undefined;

  const [loading, setLoading] = useState(false);
  const [existingMemoId, setExistingMemoId] = useState<number | undefined>(undefined);
  const [linkedLrNumber, setLinkedLrNumber] = useState('');
  const [linkedLrDate, setLinkedLrDate] = useState('');
  const [linkedArticlesCount, setLinkedArticlesCount] = useState<number | undefined>(undefined);
  const [hamali, setHamali] = useState(0);
  const [vehicleId, setVehicleId] = useState<number | undefined>(undefined);
  const [rateTypeOptions, setRateTypeOptions] = useState<string[]>([]);
  const [hireMemoNo, setHireMemoNo] = useState<string | undefined>(undefined);
  const [financialYear, setFinancialYear] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HireMemoValues>({
    resolver: zodResolver(hireMemoSchema) as Resolver<HireMemoValues>,
    defaultValues: {
      hire_memo_date: format(new Date(), 'yyyy-MM-dd'),
      commission: 0,
      other_deductions: 0,
      advance_cash: 0,
      advance_bank: 0,
      advance_payment_date: format(new Date(), 'yyyy-MM-dd'),
      balance_payment_date: format(new Date(), 'yyyy-MM-dd'),
      total_amount: 0,
    },
  });

  const watchedTotal = watch('total_amount');
  const watchedCash = watch('advance_cash');
  const watchedBank = watch('advance_bank');
  const computedBalance = (
    Number(watchedTotal || 0) -
    Number(watchedCash || 0) -
    Number(watchedBank || 0)
  ).toFixed(2);

  // Load form options (rate types, defaults)
  useEffect(() => {
    fetchFormOptions()
      .then((options) => {
        setRateTypeOptions(options.hirememo_rate_types ?? []);
        reset((prev) => ({
          ...prev,
          ack_status: prev.ack_status || options.defaults.hirememo_ack_status,
          rate_type: prev.rate_type || options.defaults.hirememo_rate_type,
        }));
      })
      .catch(() => {
        setRateTypeOptions(EMPTY_FORM_OPTIONS.hirememo_rate_types ?? []);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load existing memo data when LR changes
  useEffect(() => {
    if (!activeLrId) {
      setTimeout(() => {
        setExistingMemoId(undefined);
        setLinkedLrNumber('');
        setLinkedLrDate('');
        setLinkedArticlesCount(undefined);
      }, 0);
      return;
    }

    let mounted = true;
    setTimeout(() => { if (mounted) setLoading(true); }, 0);

    Promise.all([
      apiClient.get(`/api/lr/${activeLrId}`).catch(() => ({ data: null })),
      apiClient.get('/api/hirememo/', { params: { lr_id: activeLrId } }).catch(() => ({ data: [] })),
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
        setHamali(Number(lr?.hamali_charges || existing?.hamali || 0));
        setVehicleId(existing?.vehicle_id ?? lr?.vehicle_id);

        if (existing) {
          setHireMemoNo(existing.hire_memo_no);
          setFinancialYear((existing as any).financial_year);
          reset({
            hire_memo_date: existing.hire_memo_date || format(new Date(), 'yyyy-MM-dd'),
            branch: existing.branch || '',
            vehicle_number: existing.vehicle_number || '',
            driver_name: existing.driver_name || '',
            driver_mobile: existing.driver_mobile || '',
            driver_license: existing.driver_license || '',
            from_location: existing.from_location || '',
            to_location: existing.to_location || '',
            payment_location: existing.payment_location || '',
            rate_type: existing.rate_type || '',
            freight_rate: existing.freight_rate ?? null,
            freight_weight: existing.freight_weight ?? null,
            guaranteed_weight: existing.guaranteed_weight ?? null,
            total_amount: existing.total_amount ?? 0,
            advance_cash: existing.advance_cash ?? 0,
            advance_bank: existing.advance_bank ?? 0,
            advance_payment_date: existing.advance_payment_date || format(new Date(), 'yyyy-MM-dd'),
            balance_payment_date: existing.balance_payment_date || format(new Date(), 'yyyy-MM-dd'),
            commission: existing.commission ?? 0,
            other_deductions: existing.other_deductions ?? 0,
            ack_status: existing.ack_status || '',
            notes: existing.notes || '',
          });
        } else {
          reset((prev) => ({
            ...prev,
            hire_memo_date: format(new Date(), 'yyyy-MM-dd'),
            vehicle_number: lr?.vehicle_number || '',
            driver_name: lr?.driver_name || '',
            driver_mobile: lr?.driver_mobile || '',
            from_location: lr?.origin || '',
            to_location: lr?.destination || '',
            freight_weight: lr?.weight ? Number(lr.weight) / 1000 : 0,
          }));
        }
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [activeLrId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = handleSubmit(async (values) => {
    if (!activeLrId) {
      alert('No valid LR selected. Open Hire Memo from Dispatch Register.');
      return;
    }
    const payload = {
      ...values,
      lr_id: activeLrId,
      vehicle_id: vehicleId ?? null,
      total_amount: Number(values.total_amount || 0),
      advance_cash: Number(values.advance_cash || 0),
      advance_bank: Number(values.advance_bank || 0),
      advance_payment_date: values.advance_payment_date || null,
      balance_payment_date: values.balance_payment_date || null,
      freight_rate: values.freight_rate ? Number(values.freight_rate) : null,
      freight_weight: values.freight_weight ? Number(values.freight_weight) : null,
      guaranteed_weight: values.guaranteed_weight ? Number(values.guaranteed_weight) : null,
      commission: Number(values.commission || 0),
      hamali: hamali,
      other_deductions: Number(values.other_deductions || 0),
    };

    const res = existingMemoId
      ? await apiClient.put(`/api/hirememo/${existingMemoId}`, payload)
      : await apiClient.post('/api/hirememo/', payload);

    setExistingMemoId(res.data?.id || existingMemoId);
    navigate('/operations/dispatch');
  });

  async function handlePrint() {
    if (existingMemoId) {
      try {
        await apiClient.post(`/api/hirememo/${existingMemoId}/print`);
      } catch (err) {
        console.error('Failed to log hire memo print event', err);
      }
    }
    const values = watch();
    printHireMemo({
      ...values,
      lr_number: linkedLrNumber,
      lr_date: linkedLrDate,
      articles_count: linkedArticlesCount,
      total_amount: Number(values.total_amount || 0),
      advance_cash: Number(values.advance_cash || 0),
      advance_bank: Number(values.advance_bank || 0),
      balance: Number(computedBalance),
      freight_weight: values.freight_weight ?? undefined,
      other_deductions: values.other_deductions ?? undefined,
      notes: values.notes,
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

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded shadow"
      >
        <div className="col-span-1">
          <label className="block text-sm font-medium">HM No (Auto)</label>
          <input
            value={hireMemoNo || 'Auto on Save'}
            readOnly
            className="w-full border p-2 rounded bg-slate-50"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="hire_memo_date" className="block text-sm font-medium">Date</label>
          <input
            id="hire_memo_date"
            type="date"
            {...register('hire_memo_date')}
            className="w-full border p-2 rounded"
          />
          {errors.hire_memo_date && (
            <p className="mt-1 text-xs text-red-600">{errors.hire_memo_date.message}</p>
          )}
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Financial Year</label>
          <input
            value={financialYear || 'Auto'}
            readOnly
            className="w-full border p-2 rounded bg-slate-50"
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="branch" className="block text-sm font-medium">Branch</label>
          <input id="branch" {...register('branch')} className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-1">
          <label htmlFor="vehicle_number" className="block text-sm font-medium">Vehicle No</label>
          <input
            id="vehicle_number"
            {...register('vehicle_number')}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="driver_name" className="block text-sm font-medium">Driver Name</label>
          <input
            id="driver_name"
            {...register('driver_name')}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="driver_mobile" className="block text-sm font-medium">Driver Mobile</label>
          <input
            id="driver_mobile"
            {...register('driver_mobile')}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="from_location" className="block text-sm font-medium">From</label>
          <input
            id="from_location"
            {...register('from_location')}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="to_location" className="block text-sm font-medium">To</label>
          <input
            id="to_location"
            {...register('to_location')}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="payment_location" className="block text-sm font-medium">Payment At</label>
          <input
            id="payment_location"
            {...register('payment_location')}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="rate_type" className="block text-sm font-medium">Rate Type</label>
          <select id="rate_type" {...register('rate_type')} className="w-full border p-2 rounded">
            <option value="">Select Rate Type</option>
            {rateTypeOptions.map((rt) => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>
        </div>
        <div className="col-span-1">
          <label htmlFor="freight_rate" className="block text-sm font-medium">Rate</label>
          <input
            id="freight_rate"
            type="number"
            {...register('freight_rate')}
            className="w-full border p-2 rounded"
          />
          {errors.freight_rate && (
            <p className="mt-1 text-xs text-red-600">{errors.freight_rate.message}</p>
          )}
        </div>
        <div className="col-span-1">
          <label htmlFor="freight_weight" className="block text-sm font-medium">Weight (MT)</label>
          <input
            id="freight_weight"
            type="number"
            {...register('freight_weight')}
            className="w-full border p-2 rounded"
          />
          {errors.freight_weight && (
            <p className="mt-1 text-xs text-red-600">{errors.freight_weight.message}</p>
          )}
        </div>

        <div className="col-span-1">
          <label htmlFor="total_amount" className="block text-sm font-bold text-blue-600">
            Total Amount
          </label>
          <input
            id="total_amount"
            type="number"
            {...register('total_amount')}
            className="w-full border p-2 rounded font-bold"
          />
          {errors.total_amount && (
            <p className="mt-1 text-xs text-red-600">{errors.total_amount.message}</p>
          )}
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Balance</label>
          <input value={computedBalance} readOnly className="w-full border p-2 rounded bg-slate-50" />
        </div>
        <div className="col-span-1">
          <label htmlFor="advance_cash" className="block text-sm font-medium">Advance Cash</label>
          <input
            id="advance_cash"
            type="number"
            {...register('advance_cash')}
            className="w-full border p-2 rounded"
          />
          {errors.advance_cash && (
            <p className="mt-1 text-xs text-red-600">{errors.advance_cash.message}</p>
          )}
        </div>
        <div className="col-span-1">
          <label htmlFor="advance_bank" className="block text-sm font-medium">Advance Bank</label>
          <input
            id="advance_bank"
            type="number"
            {...register('advance_bank')}
            className="w-full border p-2 rounded"
          />
          {errors.advance_bank && (
            <p className="mt-1 text-xs text-red-600">{errors.advance_bank.message}</p>
          )}
        </div>
        <div className="col-span-1">
          <label htmlFor="advance_payment_date" className="block text-sm font-medium">
            Advance Pay Date
          </label>
          <input
            id="advance_payment_date"
            type="date"
            {...register('advance_payment_date')}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="balance_payment_date" className="block text-sm font-medium">
            Balance Pay Date
          </label>
          <input
            id="balance_payment_date"
            type="date"
            {...register('balance_payment_date')}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="commission" className="block text-sm font-medium">Commission</label>
          <input
            id="commission"
            type="number"
            {...register('commission')}
            className="w-full border p-2 rounded"
          />
          {errors.commission && (
            <p className="mt-1 text-xs text-red-600">{errors.commission.message}</p>
          )}
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Hamali</label>
          <input
            value={hamali}
            readOnly
            className="w-full border p-2 rounded bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-500">Linked from the LR Hamali Charges field.</p>
        </div>

        <div className="col-span-3">
          <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
          <textarea
            id="notes"
            {...register('notes')}
            className="w-full border p-2 rounded"
            rows={3}
          />
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
          <button
            type="button"
            onClick={() => navigate('/operations/dispatch')}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!activeLrId}
            className="px-4 py-2 border rounded bg-white disabled:opacity-60"
          >
            Print
          </button>
          <button
            type="submit"
            disabled={!activeLrId || loading || isSubmitting}
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : existingMemoId ? 'Update Hire Memo' : 'Save Hire Memo'}
          </button>
        </div>
      </form>
    </div>
  );
}
