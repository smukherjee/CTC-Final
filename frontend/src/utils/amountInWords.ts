/**
 * Convert a numeric amount to Indian Rupees words.
 * Uses lakh/crore Indian numbering system.
 *
 * e.g. inrWords(105000) → 'Rupees One Lakh Five Thousand Only'
 *
 * Backend mirror: backend/app/core/amount_in_words.py (inr_words)
 * Keep both implementations in sync when changing formatting logic.
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function twoDigits(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  return (TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')).trim();
}

function threeDigits(n: number): string {
  if (n === 0) return '';
  const hundredPart = n >= 100 ? ONES[Math.floor(n / 100)] + ' Hundred' : '';
  const remainder = n % 100;
  const twoPart = twoDigits(remainder);
  if (hundredPart && twoPart) return `${hundredPart} ${twoPart}`;
  return hundredPart || twoPart;
}

export function inrWords(amount: number): string {
  if (amount == null || isNaN(amount)) return 'Rupees Zero Only';

  const paise = Math.round((amount % 1) * 100);
  let rupees = Math.floor(Math.abs(amount));

  if (rupees === 0 && paise === 0) return 'Rupees Zero Only';

  const parts: string[] = [];

  const crore = Math.floor(rupees / 10_000_000);
  rupees %= 10_000_000;

  const lakh = Math.floor(rupees / 100_000);
  rupees %= 100_000;

  const thousand = Math.floor(rupees / 1_000);
  rupees %= 1_000;

  if (crore) parts.push(threeDigits(crore) + ' Crore');
  if (lakh) parts.push(threeDigits(lakh) + ' Lakh');
  if (thousand) parts.push(threeDigits(thousand) + ' Thousand');
  if (rupees) parts.push(threeDigits(rupees));

  const rupeeWords = parts.join(' ').trim();
  let result = rupeeWords ? `Rupees ${rupeeWords}` : 'Rupees Zero';

  if (paise) {
    result += ` And ${twoDigits(paise)} Paise`;
  }

  return result + ' Only';
}
