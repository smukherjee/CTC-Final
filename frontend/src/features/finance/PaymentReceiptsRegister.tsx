import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import apiClient from '@/lib/apiClient';
import { Trash2 } from 'lucide-react';

import AppAgGrid from '@/components/grid/AppAgGrid';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { formatDisplayDate } from '@/utils/dateFormat';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';
import { confirmDestructiveAction } from '@/utils/destructiveAction';

interface PaymentReceiptRow {
  id: number;
  payment_date: string;
  invoice_id?: number | null;
  received_from_id?: number | null;
  received_from: string;
  amount: number;
  payment_mode: string;
  financial_year: string;
  notes?: string | null;
}

interface ClientOption {
  id: number;
  name: string;
}

interface InvoiceOption {
  id: number;
  invoice_no: string;
  client_id: number;
  total_amount: number;
  tds_amount: number;
  net_amount: number;
  amount_received?: number;
  outstanding_amount?: number;
  status?: string;
}

function normalizePaymentReceiptRow(row: Record<string, unknown>): PaymentReceiptRow {
  return {
    id: Number(row?.id || 0),
    payment_date: String(row?.payment_date || ''),
    invoice_id: row?.invoice_id != null ? Number(row.invoice_id) : null,
    received_from_id: row?.received_from_id != null ? Number(row.received_from_id) : null,
    received_from: String(row?.received_from || ''),
    amount: Number((row?.amount ?? row?.net_amount) || 0),
    payment_mode: String(row?.payment_mode || 'BANK'),
    financial_year: String(row?.financial_year || ''),
    notes: row?.notes ? String(row.notes) : null,
  };
}

function normalizePaymentDate(value: unknown, fallback = ''): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return fallback;
}

export default function PaymentReceiptsRegister() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState(currentFy);
  const [rows, setRows] = useState<PaymentReceiptRow[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    invoice_id: '',
    received_from_id: '',
    amount: '',
    notes: '',
    payment_mode: 'BANK',
  });

  useEffect(() => {
    apiClient.get('/api/clients/')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setClients(
          data
            .map((client) => {
              const typedClient = client as Record<string, unknown>;
              return {
                id: Number(typedClient.id),
                name: String(typedClient.name || typedClient.client_name || '').trim(),
              };
            })
            .filter((client: ClientOption) => Number.isFinite(client.id) && client.id > 0 && client.name),
        );
      })
      .catch((err) => {
        console.error('Failed to load customers for payment receipts', err);
        setClients([]);
      });
  }, []);

  useEffect(() => {
    apiClient.get('/api/billing/invoices/', { params: { fy } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setInvoices(
          data.map((invoice) => {
            const typedInvoice = invoice as Record<string, unknown>;
            return {
              id: Number(typedInvoice.id),
              invoice_no: String(typedInvoice.invoice_no || ''),
              client_id: Number(typedInvoice.client_id || 0),
              total_amount: Number(typedInvoice.total_amount || 0),
              tds_amount: Number(typedInvoice.tds_amount || 0),
              net_amount: Number(typedInvoice.net_amount || 0),
              amount_received: Number(typedInvoice.amount_received || 0),
              outstanding_amount: Number(typedInvoice.outstanding_amount || 0),
              status: String(typedInvoice.status || 'issued'),
            };
          }),
        );
      })
      .catch((err) => {
        console.error('Failed to load invoices for payment receipts', err);
        setInvoices([]);
      });
  }, [fy]);

  const clientIdByName = useMemo(() => {
    const mapping: Record<string, number> = {};
    clients.forEach((client) => {
      mapping[client.name] = client.id;
    });
    return mapping;
  }, [clients]);

  const clientNameById = useMemo(() => {
    const mapping: Record<number, string> = {};
    clients.forEach((client) => {
      mapping[client.id] = client.name;
    });
    return mapping;
  }, [clients]);

  const invoiceById = useMemo(() => {
    const mapping: Record<number, InvoiceOption> = {};
    invoices.forEach((invoice) => {
      mapping[invoice.id] = invoice;
    });
    return mapping;
  }, [invoices]);

  const invoiceByNo = useMemo(() => {
    const mapping: Record<string, InvoiceOption> = {};
    invoices.forEach((invoice) => {
      mapping[invoice.invoice_no] = invoice;
    });
    return mapping;
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const customerId = Number(form.received_from_id || 0);
    return invoices.filter((invoice) => {
      if (customerId && invoice.client_id !== customerId) return false;
      return (invoice.outstanding_amount ?? 0) > 0.009 || String(invoice.id) === form.invoice_id;
    });
  }, [form.invoice_id, form.received_from_id, invoices]);

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => String(invoice.id) === form.invoice_id),
    [form.invoice_id, invoices],
  );

  useEffect(() => {
    if (!selectedInvoice) return;
    setForm((prev) => ({
      ...prev,
      received_from_id: String(selectedInvoice.client_id),
      amount: selectedInvoice.outstanding_amount != null
        ? String(Number(selectedInvoice.outstanding_amount).toFixed(2))
        : prev.amount,
    }));
  }, [clientNameById, selectedInvoice]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/payment-receipts/', { params: { fy } });
      setRows(Array.isArray(res.data) ? res.data.map(normalizePaymentReceiptRow) : []);
    } catch (err) {
      console.error('Failed to load payment receipts', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fy]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const resetForm = () => {
    setForm({
      payment_date: new Date().toISOString().slice(0, 10),
      invoice_id: '',
      received_from_id: '',
      amount: '',
      notes: '',
      payment_mode: 'BANK',
    });
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const buildPaymentReceiptPayload = useCallback((row: {
    payment_date: string;
    invoice_id?: number | string | null;
    received_from_id?: number | string | null;
    received_from?: string;
    amount?: number | string;
    notes?: string | null;
    payment_mode: string;
    financial_year?: string;
  }) => {
    const explicitReceivedFromId = row.received_from_id != null && row.received_from_id !== ''
      ? Number(row.received_from_id)
      : null;
    const receivedFromId = explicitReceivedFromId && Number.isFinite(explicitReceivedFromId) && explicitReceivedFromId > 0
      ? explicitReceivedFromId
      : Number(clientIdByName[String(row.received_from || '')] || 0);
    const amount = Number(row.amount || 0);

    return {
      payment_date: row.payment_date,
      invoice_id: row.invoice_id != null && row.invoice_id !== '' ? Number(row.invoice_id) : null,
      received_from_id: receivedFromId,
      amount,
      payment_mode: row.payment_mode || 'BANK',
      financial_year: row.financial_year || fy,
      notes: row.notes?.trim() || null,
    };
  }, [clientIdByName, fy]);

  const submit = async () => {
    if (!form.payment_date || !form.received_from_id || !form.amount) {
      alert('Payment date, received from, and amount are required');
      return;
    }

    if (Number(form.amount || 0) < 0) {
      alert('Amount cannot be negative');
      return;
    }

    const payload = buildPaymentReceiptPayload(form);

    try {
      await apiClient.post('/api/payment-receipts/', payload);
      resetForm();
      setIsCreateModalOpen(false);
      await loadRows();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.detail || err.message : 'Unknown error';
      alert(`Failed to save payment receipt: ${message}`);
    }
  };

  const onCellValueChanged = useCallback(async (event: { data?: PaymentReceiptRow }) => {
    const row = event?.data;
    if (!row?.id) return;

    const existingRow = rows.find((item) => item.id === row.id);
    const mergedRow: PaymentReceiptRow = {
      ...(existingRow || row),
      ...row,
      payment_date: normalizePaymentDate(row.payment_date, existingRow?.payment_date || ''),
      invoice_id: row.invoice_id ?? existingRow?.invoice_id ?? null,
      received_from_id: row.received_from_id ?? existingRow?.received_from_id ?? null,
      received_from: String(row.received_from || existingRow?.received_from || '').trim(),
      amount: Number(row.amount ?? existingRow?.amount ?? 0),
      payment_mode: String(row.payment_mode || existingRow?.payment_mode || 'BANK'),
      financial_year: String(row.financial_year || existingRow?.financial_year || fy),
      notes: row.notes ?? existingRow?.notes ?? null,
    };

    const payload = buildPaymentReceiptPayload(mergedRow);
    if (!payload.payment_date) {
      alert('Payment date is required');
      await loadRows();
      return;
    }
    if (!payload.received_from_id && !mergedRow.received_from) {
      alert('Received from is required');
      await loadRows();
      return;
    }
    if (Number(payload.amount || 0) < 0) {
      alert('Amount cannot be negative');
      await loadRows();
      return;
    }

    try {
      await apiClient.put(`/api/payment-receipts/${row.id}`, payload);
      await loadRows();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.detail || err.message : 'Unknown error';
      alert(`Failed to update payment receipt: ${message}`);
      await loadRows();
    }
  }, [buildPaymentReceiptPayload, fy, loadRows, rows]);

  const removeRow = useCallback(async (id: number) => {
    const row = rows.find((item) => item.id === id);
    const subject = row?.received_from || `Receipt ${id}`;
    if (!confirmDestructiveAction({ action: 'Delete this payment receipt', subject })) return;
    try {
      await apiClient.delete(`/api/payment-receipts/${id}`);
      await loadRows();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.detail || err.message : 'Unknown error';
      alert(`Failed to delete: ${message}`);
    }
  }, [loadRows, rows]);

  const colDefs = useMemo(() => [
    {
      field: 'payment_date',
      headerName: 'PAYMENT DATE',
      minWidth: 150,
      flex: 1,
      editable: true,
      cellDataType: 'dateString',
      cellEditor: 'agDateStringCellEditor',
      valueSetter: (params: { data: PaymentReceiptRow; newValue: unknown; oldValue: unknown }) => {
        const fallback = normalizePaymentDate(params.oldValue, normalizePaymentDate(params.data.payment_date, ''));
        const nextValue = normalizePaymentDate(params.newValue, fallback);
        if (!nextValue) {
          return false;
        }
        if (nextValue === params.data.payment_date) {
          return false;
        }
        params.data.payment_date = nextValue;
        return true;
      },
      valueFormatter: (params: { value: unknown; node?: { rowPinned?: boolean } }) => {
        if (params.node?.rowPinned) {
          return String(params.value || '');
        }
        return formatDisplayDate(params.value as string | Date | null | undefined);
      },
    },
    {
      field: 'invoice_id',
      headerName: 'INVOICE REF',
      minWidth: 140,
      flex: 1,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['', ...invoices.map((invoice) => invoice.invoice_no)],
      },
      valueGetter: (params: { data: PaymentReceiptRow }) => {
        const invoiceId = Number(params.data.invoice_id || 0);
        if (!Number.isFinite(invoiceId) || invoiceId <= 0) return '';
        return invoiceById[invoiceId]?.invoice_no || '';
      },
      valueSetter: (params: { data: PaymentReceiptRow; newValue: unknown }): boolean => {
        const selectedInvoiceNo = String(params.newValue || '').trim();
        const invoice = selectedInvoiceNo ? invoiceByNo[selectedInvoiceNo] : undefined;
        const previousInvoiceId = params.data.invoice_id ?? null;

        params.data.invoice_id = invoice?.id ?? null;

        if (invoice) {
          const clientName = clientNameById[invoice.client_id] || params.data.received_from || '';
          params.data.received_from_id = invoice.client_id;
          params.data.received_from = clientName;
          params.data.amount = Number(invoice.outstanding_amount || 0);
        }

        return (params.data.invoice_id ?? null) !== previousInvoiceId;
      },
    },
    {
      field: 'received_from',
      headerName: 'RECEIVED FROM',
      minWidth: 220,
      flex: 1.4,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: clients.map((client) => client.name) },
      valueSetter: (params: { data: PaymentReceiptRow; newValue: unknown }) => {
        const clientName = String(params.newValue || '').trim();
        params.data.received_from = clientName;
        params.data.received_from_id = clientName ? clientIdByName[clientName] ?? null : null;
        return true;
      },
    },
    {
      field: 'amount',
      headerName: 'AMOUNT RECEIVED',
      minWidth: 150,
      flex: 1,
      editable: true,
      currencyTotal: true,
      valueParser: (params: { newValue: unknown }) => Number(params.newValue || 0),
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params: { value: unknown }) => Number(params.value || 0).toFixed(2),
    },
    {
      field: 'payment_mode',
      headerName: 'MODE OF PAYMENT',
      minWidth: 150,
      flex: 1,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['BANK', 'CHEQUE', 'CASH', 'NEFT', 'RTGS', 'IMPS', 'UPI'],
      },
    },
    {
      field: 'notes',
      headerName: 'NOTES',
      minWidth: 220,
      flex: 1.4,
      editable: true,
      valueFormatter: (params: { value: unknown }) => String(params.value || '-'),
    },
    {
      headerName: 'ACT',
      width: 96,
      pinned: 'right',
      editable: false,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: PaymentReceiptRow }) => (
        <div className="flex items-center justify-center h-full gap-1">
          <button
            type="button"
            onClick={() => removeRow(params.data.id)}
            className="h-11 w-11 inline-flex items-center justify-center rounded-md hover:bg-red-100 text-red-600 transition-colors"
            title="Delete"
            aria-label="Delete payment receipt"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ], [clientIdByName, clientNameById, clients, invoiceById, invoiceByNo, invoices, removeRow]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payment Receipts Register</h2>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="receipts_fy" className="text-sm font-medium text-slate-700">FY</label>
          <select
            id="receipts_fy"
            value={fy}
            onChange={(e) => setFy(e.target.value)}
            className="w-28 rounded border px-2 py-2 text-sm bg-white"
          >
            {fyOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Payment Receipt
          </button>
        </div>
      </div>

      <AppAgGrid<PaymentReceiptRow>
        rowData={rows}
        columnDefs={colDefs}
        loading={loading}
        noRowsMessage={`No payment receipts found for FY ${fy}.`}
        defaultColDef={{ editable: false }}
        getRowId={(params: { data: PaymentReceiptRow }) => String(params.data.id)}
        rowSelection={{ mode: 'singleRow', enableClickSelection: false, checkboxes: false }}
        onCellValueChanged={onCellValueChanged}
        editType="fullRow"
        showCurrencyTotals={true}
        currencyTotalLabelField="payment_date"
        fitColumns={false}
        alwaysShowHorizontalScroll={true}
      />

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogTitle>New Payment Receipt</DialogTitle>
          <DialogDescription>
            Create a payment receipt.
          </DialogDescription>
          <div className="grid grid-cols-1 gap-2 rounded border bg-white p-4 md:grid-cols-12">
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="receipt_payment_date" className="text-sm font-medium text-slate-700">Payment date</label>
              <input id="receipt_payment_date" type="date" value={form.payment_date} onChange={(e) => setForm((p) => ({ ...p, payment_date: e.target.value }))} className="w-full rounded border px-2 py-2" />
            </div>
            <div className="space-y-1 md:col-span-3">
              <label htmlFor="receipt_invoice_id" className="text-sm font-medium text-slate-700">Invoice reference</label>
              <select id="receipt_invoice_id" value={form.invoice_id} onChange={(e) => setForm((p) => ({ ...p, invoice_id: e.target.value }))} className="w-full rounded border px-2 py-2">
                <option value="">Unlinked receipt</option>
                {filteredInvoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_no} | Outstanding {Number(invoice.outstanding_amount || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-4">
              <label htmlFor="receipt_received_from" className="text-sm font-medium text-slate-700">Received from</label>
              <select
                id="receipt_received_from"
                value={form.received_from_id}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setForm((p) => ({
                    ...p,
                    received_from_id: nextId,
                  }));
                }}
                className="w-full rounded border px-2 py-2"
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-3">
              <label htmlFor="receipt_amount" className="text-sm font-medium text-slate-700">Amount</label>
              <input id="receipt_amount" type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="w-full rounded border px-2 py-2" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="receipt_payment_mode" className="text-sm font-medium text-slate-700">Mode of payment</label>
              <select id="receipt_payment_mode" value={form.payment_mode} onChange={(e) => setForm((p) => ({ ...p, payment_mode: e.target.value }))} className="w-full rounded border px-2 py-2">
                {['BANK', 'CHEQUE', 'CASH', 'NEFT', 'RTGS', 'IMPS', 'UPI'].map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-8">
              <label htmlFor="receipt_notes" className="text-sm font-medium text-slate-700">Notes</label>
              <input id="receipt_notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full rounded border px-2 py-2" />
            </div>
            {selectedInvoice && (
              <div className="rounded border bg-slate-50 px-3 py-2 text-sm text-slate-700 md:col-span-4">
                Status: <span className="font-medium">{selectedInvoice.status || 'issued'}</span> | Received: <span className="font-medium">{Number(selectedInvoice.amount_received || 0).toFixed(2)}</span> | Outstanding: <span className="font-medium">{Number(selectedInvoice.outstanding_amount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex gap-2 md:col-span-12">
              <button type="button" onClick={submit} className="rounded bg-slate-900 px-4 py-2 text-white">
                Add
              </button>
              <button type="button" onClick={() => { resetForm(); setIsCreateModalOpen(false); }} className="rounded border px-4 py-2 text-slate-700">
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
