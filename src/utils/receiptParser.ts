export interface ParsedReceiptItem {
  name: string;
  quantity: number;
  selected: boolean;
}

// Lines that are likely noise (not food items)
const NOISE_PATTERNS = [
  /^(sub\s*total|subtotal|total|tax|vat|gst|hst|change|cash|card|visa|master|amex|debit|credit|eftpos|balance)/i,
  /^(thank|welcome|receipt|invoice|order|store|branch|tel|phone|fax|www\.|http|email|address|abn|gst\s*no)/i,
  /^(date|time|trans|ref|auth|appr|terminal|operator|cashier|server|table|guest)/i,
  /^(save|saving|you\s*saved|reward|points|loyalty|member|discount|promo|coupon)/i,
  /^(payment|paid|tender|amount\s*due|due|owing|net|gross)/i,
  /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/, // dates
  /^\d{1,2}:\d{2}/, // times
  /^[\d\s\.\-\$\£\€\¥]+$/, // price-only lines
  /^[#\*\-=_]{3,}$/, // separators
  /^\s*$/, // empty lines
  /^x{2,}/i, // xxx patterns
  /^[\W\d]+$/, // only special chars and digits
];

// Pattern to detect a quantity prefix like "2x ", "3 x ", "2 "
const QTY_PREFIX = /^(\d+)\s*[xX×]\s*/;

export function parseReceiptText(rawText: string): ParsedReceiptItem[] {
  const lines = rawText.split('\n');
  const items: ParsedReceiptItem[] = [];

  for (const line of lines) {
    let cleaned = line.trim();

    // Skip very short lines (likely noise)
    if (cleaned.length < 2) continue;

    // Check noise patterns
    const isNoise = NOISE_PATTERNS.some((pattern) => pattern.test(cleaned));
    if (isNoise) continue;

    // Remove trailing prices (e.g., "$4.99", "4.99", "£2.50")
    cleaned = cleaned.replace(/[\$\£\€\¥]?\s*\d+[.,]\d{2}\s*[A-Z]?\s*$/, '').trim();

    // Remove leading item numbers/codes
    cleaned = cleaned.replace(/^\d{4,}\s+/, '').trim();

    // Skip if nothing left after cleanup
    if (cleaned.length < 2) continue;

    // Detect quantity prefix
    let quantity = 1;
    const qtyMatch = cleaned.match(QTY_PREFIX);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10);
      cleaned = cleaned.replace(QTY_PREFIX, '').trim();
    }

    // Skip if it still looks like noise after cleanup
    if (/^[\d\s\.\-]+$/.test(cleaned)) continue;

    // Capitalize first letter of each word for nicer display
    const name = cleaned
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

    if (name.length >= 2) {
      items.push({ name, quantity, selected: true });
    }
  }

  return items;
}
