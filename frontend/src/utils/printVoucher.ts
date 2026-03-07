import Handlebars from 'handlebars';
import { format } from 'date-fns';

import { inrWords } from '@/utils/amountInWords';
import voucherTemplateSource from '@/templates/voucher-template.hbs?raw';

const voucherTemplate = Handlebars.compile(voucherTemplateSource);

interface VoucherPrintData {
  id: number;
  voucher_type: string;
  reference_id?: number;
  reference_type?: string;
  amount: number;
  narration?: string;
  date: string;
}

export function printVoucher(data: VoucherPrintData) {
  const amount = Number(data.amount || 0);
  const templateData = {
    ...data,
    date: format(new Date(data.date), 'dd/MM/yyyy'),
    amount: amount.toFixed(2),
    amount_in_words: inrWords(amount),
  };

  const html = voucherTemplate(templateData);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the Voucher');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
