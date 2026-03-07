import Handlebars from 'handlebars';
import { format } from 'date-fns';
import { inrWords } from '@/utils/amountInWords';
import { formatDisplayDate } from '@/utils/dateFormat';

import hireMemoTemplateSource from '@/templates/hirememo-template.hbs?raw';

const hireMemoTemplate = Handlebars.compile(hireMemoTemplateSource);

export interface HireMemoPrintData {
  hire_memo_no?: string;
  hire_memo_date?: string;
  branch?: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_license?: string;
  from_location?: string;
  to_location?: string;
  payment_location?: string;
  rate_type?: string;
  freight_weight?: number | string;
  total_amount?: number | string;
  advance_cash?: number | string;
  advance_bank?: number | string;
  balance?: number | string;
  other_deductions?: number | string;
  notes?: string;
  articles_count?: number | string;
  lr_number?: string;
  lr_date?: string;
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value: number): string {
  return value.toFixed(2);
}

export function printHireMemo(data: Partial<HireMemoPrintData>) {
  const totalAmount = toNumber(data.total_amount);
  const partPayment = toNumber(data.advance_cash) + toNumber(data.advance_bank);
  const balance = data.balance !== undefined ? toNumber(data.balance) : totalAmount - partPayment;

  const templateData = {
    ...data,
    hire_memo_date: formatDisplayDate(data.hire_memo_date, ''),
    lr_date: formatDisplayDate(data.lr_date, ''),
    articles_count: data.articles_count || '',
    freight_weight: data.freight_weight || '',
    total_amount: formatMoney(totalAmount),
    part_payment: formatMoney(partPayment),
    balance: formatMoney(balance),
    other_deductions: data.other_deductions || '',
    notes: data.notes || '',
    balance_in_words: inrWords(balance),
    generated_at: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
  };

  const html = hireMemoTemplate(templateData);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the Hire Memo');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
