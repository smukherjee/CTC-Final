"""Convert a Decimal/float amount to Indian Rupees words.

Uses lakh/crore Indian numbering system.
e.g. inr_words(105000) → 'Rupees One Lakh Five Thousand Only'
"""
from decimal import Decimal


_ONES = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
]

_TENS = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
]


def _two_digits(n: int) -> str:
    if n == 0:
        return ''
    if n < 20:
        return _ONES[n]
    return (_TENS[n // 10] + (' ' + _ONES[n % 10] if n % 10 else '')).strip()


def _three_digits(n: int) -> str:
    if n == 0:
        return ''
    hundred_part = _ONES[n // 100] + ' Hundred' if n >= 100 else ''
    remainder = n % 100
    two_part = _two_digits(remainder)
    if hundred_part and two_part:
        return hundred_part + ' ' + two_part
    return hundred_part or two_part


def inr_words(amount) -> str:
    """Convert a numeric amount to Indian Rupees words.

    Args:
        amount: int, float, or Decimal

    Returns:
        str: e.g. 'Rupees One Lakh Five Thousand Only'
    """
    if amount is None:
        return 'Rupees Zero Only'

    amount = Decimal(str(amount))
    paise = round((amount % 1) * 100)
    rupees = int(amount)

    if rupees == 0 and paise == 0:
        return 'Rupees Zero Only'

    parts = []

    crore = rupees // 10_000_000
    rupees %= 10_000_000

    lakh = rupees // 100_000
    rupees %= 100_000

    thousand = rupees // 1_000
    rupees %= 1_000

    hundred_and_below = rupees

    if crore:
        parts.append(_three_digits(crore) + ' Crore')
    if lakh:
        parts.append(_three_digits(lakh) + ' Lakh')
    if thousand:
        parts.append(_three_digits(thousand) + ' Thousand')
    if hundred_and_below:
        parts.append(_three_digits(hundred_and_below))

    rupee_words = ' '.join(parts).strip()
    result = f"Rupees {rupee_words}" if rupee_words else 'Rupees Zero'

    if paise:
        result += f" And {_two_digits(int(paise))} Paise"

    return result + ' Only'
