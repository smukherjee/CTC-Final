import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { getCurrentFy } from '@/utils/financialYear';
import { printInvoice } from '@/utils/printInvoice';

interface PartyItem {
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
  return Number(line.freight || 0)
    + Number(line.loading_detention || 0)
    + Number(line.unloading_charges || 0)
    + Number(line.unloading_detention || 0)
    + Number(line.other_charges || 0);
}

export default function InvoiceForm() {
  const [fy, setFy] = useState(getCurrentFy());
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [partyId, setPartyId] = useState('');
  const [poNo, setPoNo] = useState('');
  const [poDate, setPoDate] = useState('');
  const [tdsAmount, setTdsAmount] = useState(0);

  const [parties, setParties] = useState<PartyItem[]>([]);
  const [lrs, setLrs] = useState<LrItem[]>([]);
  const [selectedLrIds, setSelectedLrIds] = useState<number[]>([]);
  const [lines, setLines] = useState<InvoiceLineDraft[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/party/')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setParties(data.map((party: any) => ({
          id: Number(party.id),
          name: String(party.name || party.party_name || `Party ${party.id}`),
          address: party.address || '',
          gstin: party.gstin || '',
        })));
      })
      .catch((err) => {
        console.error('Failed to load parties', err);
      });
  }, []);

  useEffect(() => {
    axios.get('/api/lr/', { params: { fy } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setLrs(data);
      })
      .catch((err) => {
        console.error('Failed to load LRs', err);
        setLrs([]);
      });
  }, [fy]);

  useEffect(() => {
    const selectedLrs = lrs.filter((lr) => selectedLrIds.includes(Number(lr.id)));
    setLines(selectedLrs.map((lr, index) => ({
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
    })));
  }, [selectedLrIds, lrs]);

  const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + lineTotal(line), 0), [lines]);
  const netAmount = useMemo(() => totalAmount - Number(tdsAmount || 0), [totalAmount, tdsAmount]);

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === Number(partyId)),
    [parties, partyId],
  );

  const toggleLr = (id: number) => {
    setSelectedLrIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const updateLine = (index: number, key: keyof InvoiceLineDraft, value: number) => {
    setLines((prev) => prev.map((line, idx) => (idx === index ? { ...line, [key]: Number(value || 0) } : line)));
  };

  const handlePrint = async () => {
    if (!Number(partyId) || lines.length === 0) {
      alert('Select party and at least one LR');
      return;
    }

    const payload = {
      invoice_date: invoiceDate,
      party_id: Number(partyId),
      financial_year: fy,
      po_no: poNo || null,
      po_date: poDate || null,
      total_amount: totalAmount,
      tds_amount: Number(tdsAmount || 0),
      lines: lines.map((line) => ({
        ...line,
        qty: 1,
        particulars: 'Transport Service',
        total: lineTotal(line),
      })),
    };

    setSaving(true);
    try {
      const res = await axios.post('/api/billing/invoices/', payload);
      const invoice = res.data;
      printInvoice({
        invoice_no: invoice.invoice_no,
        invoice_date: invoice.invoice_date,
        po_no: invoice.po_no || '',
        po_date: invoice.po_date || '',
        hsn_code: invoice.hsn_code || '996791',
        party_name: selectedParty?.name || '',
        party_address: selectedParty?.address || '',
        party_gstin: selectedParty?.gstin || '',
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
    } catch (err: any) {
      alert(`Failed to create/print invoice: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invoice Form</h2>
        <p className="text-sm text-slate-500">Create invoice from selected LRs and print using invoice template.</p>
        <Link to="/finance/invoices" className="mt-2 inline-block text-sm text-blue-700 hover:underline">
          Back to Bill Notebook
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded border bg-white p-4 md:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">FY</label>
          <input value={fy} onChange={(e) => setFy(e.target.value)} className="w-full rounded border px-2 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Invoice Date</label>
          <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full rounded border px-2 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Party</label>
          <select value={partyId} onChange={(e) => setPartyId(e.target.value)} className="w-full rounded border px-2 py-2">
            <option value="">Select party</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>{party.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">PO No</label>
          <input value={poNo} onChange={(e) => setPoNo(e.target.value)} className="w-full rounded border px-2 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">PO Date</label>
          <input type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} className="w-full rounded border px-2 py-2" />
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
              <span>{lr.lr_number || `LR ${lr.id}`} | {lr.origin || '-'} to {lr.destination || '-'}</span>
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
                <td className="px-2 py-2"><input type="number" value={line.freight} onChange={(e) => updateLine(idx, 'freight', Number(e.target.value))} className="w-24 rounded border px-2 py-1" /></td>
                <td className="px-2 py-2"><input type="number" value={line.loading_detention} onChange={(e) => updateLine(idx, 'loading_detention', Number(e.target.value))} className="w-24 rounded border px-2 py-1" /></td>
                <td className="px-2 py-2"><input type="number" value={line.unloading_charges} onChange={(e) => updateLine(idx, 'unloading_charges', Number(e.target.value))} className="w-24 rounded border px-2 py-1" /></td>
                <td className="px-2 py-2"><input type="number" value={line.unloading_detention} onChange={(e) => updateLine(idx, 'unloading_detention', Number(e.target.value))} className="w-24 rounded border px-2 py-1" /></td>
                <td className="px-2 py-2"><input type="number" value={line.other_charges} onChange={(e) => updateLine(idx, 'other_charges', Number(e.target.value))} className="w-24 rounded border px-2 py-1" /></td>
                <td className="px-2 py-2 font-semibold">{lineTotal(line).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-4 rounded border bg-white p-4">
        <div className="text-sm">Total: <span className="font-semibold">{totalAmount.toFixed(2)}</span></div>
        <div className="flex items-center gap-2 text-sm">
          <span>TDS:</span>
          <input
            type="number"
            value={tdsAmount}
            onChange={(e) => setTdsAmount(Number(e.target.value || 0))}
            className="w-28 rounded border px-2 py-1"
          />
        </div>
        <div className="text-sm">Net: <span className="font-semibold">{netAmount.toFixed(2)}</span></div>
        <button
          type="button"
          onClick={handlePrint}
          disabled={saving}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {saving ? 'Processing...' : 'Print'}
        </button>
      </div>
    </div>
  );
}
