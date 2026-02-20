import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { EMPTY_FORM_OPTIONS, fetchFormOptions, type FormOptions } from '@/config/formOptions';

// Define the full interface matching backend schema
export interface HireMemo {
  id: number;
  lr_id: number;
  hire_memo_no?: string;
  hire_memo_date?: string;
  branch?: string;

  // Vehicle & Driver
  vehicle_id?: number;
  vehicle_number?: string;
  driver_name?: string;
  driver_mobile?: string;
  driver_license?: string;

  // Route
  from_location?: string;
  to_location?: string;
  payment_location?: string;

  // Financials
  rate_type?: string; // FIXED, PER_TON
  freight_rate?: number;
  freight_weight?: number;
  guaranteed_weight?: number;
  total_amount: number;
  advance_cash?: number;
  advance_bank?: number;
  balance?: number;

  // Deductions
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

  const [hms, setHms] = useState<HireMemo[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOptions, setFormOptions] = useState<FormOptions>(EMPTY_FORM_OPTIONS);
  const [form, setForm] = useState<Partial<HireMemo>>({
    lr_id: queryLrId && queryLrId !== 'undefined' && !isNaN(parseInt(queryLrId))
      ? parseInt(queryLrId)
      : undefined,
    hire_memo_date: format(new Date(), 'yyyy-MM-dd'),
    commission: 0,
    hamali: 0,
    mamul: 0,
    other_deductions: 0,
    advance_cash: 0,
    advance_bank: 0,
  });

  useEffect(() => {
    loadMemos();
    if (queryLrId && queryLrId !== 'undefined' && !isNaN(parseInt(queryLrId))) {
      loadLRDetails(queryLrId);
    }
  }, [queryLrId]);

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

  function loadMemos() {
    setLoading(true);
    axios
      .get('/api/hirememo/')
      .then((r) => setHms(r.data || []))
      .catch((e) => console.error('Failed to load hire memos', e))
      .finally(() => setLoading(false));
  }

  function loadLRDetails(id: string) {
    axios.get(`/api/lr/${id}`)
      .then(res => {
        const lr = res.data;
        // Pre-fill form with LR data
        setForm(prev => ({
          ...prev,
          lr_id: parseInt(id),
          vehicle_number: lr.vehicle_number,
          vehicle_id: lr.vehicle_id,
          driver_name: lr.driver_name,
          driver_mobile: lr.driver_mobile,
          from_location: lr.origin,
          to_location: lr.destination,
          // Default freight weight to LR weight (converted to tons if needed, assuming LR weight in KG)
          freight_weight: lr.weight ? lr.weight / 1000 : 0,
        }));
      })
      .catch(err => console.error("Failed to load LR details", err));
  }


  function updateField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.lr_id) {
      alert("Error: No Linked LR ID found. Please go back to Dispatch Register and select a valid LR.");
      return;
    }

    // Sanitize payload: convert strings to numbers
    const payload = {
      ...form,
      lr_id: Number(form.lr_id), // invalid if NaN, but shouldn't happen with readOnly
      total_amount: Number(form.total_amount || 0),
      advance_cash: Number(form.advance_cash || 0),
      advance_bank: Number(form.advance_bank || 0),

      // Optionals: convert empty string to null/undefined or parse
      freight_rate: form.freight_rate ? Number(form.freight_rate) : null,
      freight_weight: form.freight_weight ? Number(form.freight_weight) : null,
      guaranteed_weight: form.guaranteed_weight ? Number(form.guaranteed_weight) : null,

      // Deductions
      commission: Number(form.commission || 0),
      hamali: Number(form.hamali || 0),
      mamul: Number(form.mamul || 0),
      other_deductions: Number(form.other_deductions || 0),

      // IDs
      vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
    };

    axios
      .post('/api/hirememo/', payload)
      .then((r) => {
        setHms((s) => [r.data, ...s]);
        alert("Hire Memo Created!");
        // Maybe navigate back or clear form
        if (queryLrId) navigate('/operations/dispatch');
      })
      .catch((e) => {
        console.error(e);
        alert('Failed to create hire memo: ' + (e.response?.data?.detail || e.message));
      });
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Hire Memo Entry</h2>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded shadow mb-6">

        {/* Row 1: Meta */}
        <div className="col-span-1">
          <label className="block text-sm font-medium">HM No (Manual)</label>
          <input name="hire_memo_no" value={form.hire_memo_no || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Date</label>
          <input type="date" name="hire_memo_date" value={form.hire_memo_date || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Linked LR ID</label>
          <input name="lr_id" value={form.lr_id || ''} readOnly className="w-full border p-2 rounded bg-gray-100" />
        </div>

        {/* Row 2: Vehicle & Driver */}
        <div className="col-span-1">
          <label className="block text-sm font-medium">Vehicle No</label>
          <input name="vehicle_number" value={form.vehicle_number || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Driver Name</label>
          <input name="driver_name" value={form.driver_name || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Driver Mobile</label>
          <input name="driver_mobile" value={form.driver_mobile || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        {/* Row 3: Route */}
        <div className="col-span-1">
          <label className="block text-sm font-medium">From</label>
          <input name="from_location" value={form.from_location || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">To</label>
          <input name="to_location" value={form.to_location || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Payment At</label>
          <input name="payment_location" value={form.payment_location || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-3 border-t my-2"></div>

        {/* Row 4: Freight Calculation */}
        <div className="col-span-1">
          <label className="block text-sm font-medium">Rate Type</label>
          <select name="rate_type" value={form.rate_type || ''} onChange={updateField} className="w-full border p-2 rounded">
            <option value="">Select Rate Type</option>
            {formOptions.hirememo_rate_types.map((rateType) => (
              <option key={rateType} value={rateType}>{rateType}</option>
            ))}
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Rate</label>
          <input type="number" name="freight_rate" value={form.freight_rate || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Weight (MT)</label>
          <input type="number" name="freight_weight" value={form.freight_weight || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        {/* Row 5: Financials */}
        <div className="col-span-1">
          <label className="block text-sm font-bold text-blue-600">Total Amount</label>
          <input type="number" name="total_amount" value={form.total_amount || ''} onChange={updateField} className="w-full border p-2 rounded font-bold" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Advance Cash</label>
          <input type="number" name="advance_cash" value={form.advance_cash || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Advance Bank</label>
          <input type="number" name="advance_bank" value={form.advance_bank || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        {/* Row 6: Deductions */}
        <h3 className="col-span-3 font-semibold mt-2">Deductions</h3>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Commission</label>
          <input type="number" name="commission" value={form.commission || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Hamali</label>
          <input type="number" name="hamali" value={form.hamali || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium">Mamul</label>
          <input type="number" name="mamul" value={form.mamul || ''} onChange={updateField} className="w-full border p-2 rounded" />
        </div>

        {/* Submit */}
        <div className="col-span-3 mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-800">Save Hire Memo</button>
        </div>
      </form>

      {/* List Recent */}
      <div className="mt-8">
        <h3 className="font-bold text-lg mb-2">Recent Hire Memos</h3>
        {loading ? <div>Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">HM No</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Vehicle</th>
                  <th className="p-2 border">Driver</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {hms.slice(0, 10).map(h => (
                  <tr key={h.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 border">{h.hire_memo_no || h.id}</td>
                    <td className="p-2 border">{h.hire_memo_date}</td>
                    <td className="p-2 border">{h.vehicle_number}</td>
                    <td className="p-2 border">{h.driver_name}</td>
                    <td className="p-2 border">{h.total_amount}</td>
                    <td className="p-2 border">{h.ack_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
