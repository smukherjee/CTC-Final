import Handlebars from 'handlebars';
import { format } from 'date-fns';

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

function numberToWords(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero';

  const below20 = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const twoDigits = (v: number): string => {
    if (v < 20) return below20[v];
    const t = Math.floor(v / 10);
    const r = v % 10;
    return `${tens[t]}${r ? ` ${below20[r]}` : ''}`;
  };

  const threeDigits = (v: number): string => {
    const h = Math.floor(v / 100);
    const r = v % 100;
    if (!h) return twoDigits(r);
    return `${below20[h]} Hundred${r ? ` ${twoDigits(r)}` : ''}`;
  };

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rest) parts.push(threeDigits(rest));

  return parts.join(' ').trim();
}

export function printHireMemo(data: Partial<HireMemoPrintData>) {
  const totalAmount = toNumber(data.total_amount);
  const partPayment = toNumber(data.advance_cash) + toNumber(data.advance_bank);
  const balance = data.balance !== undefined ? toNumber(data.balance) : totalAmount - partPayment;

  const templateData = {
    ...data,
    hire_memo_date: data.hire_memo_date
      ? format(new Date(String(data.hire_memo_date)), 'dd/MM/yy')
      : '',
    lr_date: data.lr_date
      ? format(new Date(String(data.lr_date)), 'dd/MM/yy')
      : '',
    articles_count: data.articles_count || '',
    freight_weight: data.freight_weight || '',
    total_amount: formatMoney(totalAmount),
    part_payment: formatMoney(partPayment),
    balance: formatMoney(balance),
    other_deductions: data.other_deductions || '',
    notes: data.notes || '',
    balance_in_words: numberToWords(balance),
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
