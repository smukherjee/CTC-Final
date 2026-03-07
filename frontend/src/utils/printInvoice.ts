import Handlebars from 'handlebars';
import { format } from 'date-fns';

import { inrWords } from '@/utils/amountInWords';
import invoiceTemplateSource from '@/templates/invoice-template.hbs?raw';

const invoiceTemplate = Handlebars.compile(invoiceTemplateSource);

export interface InvoicePrintLine {
  s_no?: number;
  lr_no?: string;
  lr_date?: string;
  qty?: number;
  particulars?: string;
  v_type?: string;
  vehicle_no?: string;
  consignor?: string;
  consignee?: string;
  from_city?: string;
  to_city?: string;
  freight?: number;
  loading_detention?: number;
  unloading_charges?: number;
  unloading_detention?: number;
  other_charges?: number;
  total?: number;
}

export interface InvoicePrintData {
  invoice_no?: string;
  invoice_date?: string;
  po_no?: string;
  po_date?: string;
  hsn_code?: string;
  party_name?: string;
  party_address?: string;
  party_gstin?: string;
  reverse_charge?: boolean;
  gst_paid_by?: string;
  total_amount?: number;
  tds_amount?: number;
  net_amount?: number;
  lines?: InvoicePrintLine[];
}

function money(value: unknown): string {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

function dateText(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return format(d, 'dd/MM/yyyy');
}

export function printInvoice(data: InvoicePrintData) {
  const totalAmount = Number(data.total_amount || 0);
  const tdsAmount = Number(data.tds_amount || 0);
  const netAmount = data.net_amount !== undefined ? Number(data.net_amount) : totalAmount - tdsAmount;

  const templateData = {
    invoice_no: data.invoice_no || '',
    invoice_date: dateText(data.invoice_date),
    po_no: data.po_no || '',
    po_date: dateText(data.po_date),
    hsn_code: data.hsn_code || '996791',
    party_name: data.party_name || '',
    party_address: data.party_address || '',
    party_gstin: data.party_gstin || '',
    reverse_charge_label: data.reverse_charge ? 'Yes' : 'No',
    gst_paid_by: data.gst_paid_by || '',
    total_amount: money(totalAmount),
    tds_amount: money(tdsAmount),
    net_amount: money(netAmount),
    amountInWords: inrWords(netAmount),
    generated_at: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
    lines: (data.lines || []).map((line, index) => ({
      s_no: line.s_no ?? index + 1,
      lr_no: line.lr_no || '',
      lr_date: dateText(line.lr_date),
      qty: line.qty ?? '',
      particulars: line.particulars || '',
      v_type: line.v_type || '',
      vehicle_no: line.vehicle_no || '',
      consignor: line.consignor || '',
      consignee: line.consignee || '',
      from_city: line.from_city || '',
      to_city: line.to_city || '',
      freight: money(line.freight),
      loading_detention: money(line.loading_detention),
      unloading_charges: money(line.unloading_charges),
      unloading_detention: money(line.unloading_detention),
      other_charges: money(line.other_charges),
      total: money(line.total),
    })),
  };

  const html = invoiceTemplate(templateData);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the Invoice');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
