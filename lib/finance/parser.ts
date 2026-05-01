import { categorizeTransaction } from './categorize';
import { toInputDate } from './format';
import type { ParsedSmsTransaction, TransactionType } from './types';

const amountPatterns = [
  /(?:ETB|Birr)\s*([\d,]+(?:\.\d{1,2})?)/i,
  /([\d,]+(?:\.\d{1,2})?)\s*(?:ETB|Birr)/i,
];

const datePatterns = [
  /(\d{4}-\d{2}-\d{2})/,
  /(\d{1,2}\/\d{1,2}\/\d{4})/,
  /(\d{1,2}-\d{1,2}-\d{4})/,
];

export function parseSmsMessages(input: string): ParsedSmsTransaction[] {
  return input
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseSmsMessage)
    .filter((transaction): transaction is ParsedSmsTransaction => Boolean(transaction));
}

export function parseSmsMessage(message: string): ParsedSmsTransaction | null {
  const amount = extractAmount(message);
  if (!amount) return null;

  const type = inferType(message);
  const merchant = extractParty(message, type);
  const date = extractDate(message);
  const category = categorizeTransaction(message, type);

  return {
    amount,
    type,
    category,
    note: merchant ? `${typeLabel(type)}: ${merchant}` : typeLabel(type),
    date,
    merchant,
    rawMessage: message,
    confidence: scoreConfidence(message, merchant),
  };
}

function extractAmount(message: string) {
  for (const pattern of amountPatterns) {
    const match = message.match(pattern);
    if (match?.[1]) return Number(match[1].replaceAll(',', ''));
  }

  return 0;
}

function inferType(message: string): TransactionType {
  const normalized = message.toLowerCase();
  if (/\bsavings deposit|saved|saving\b/.test(normalized)) return 'savings';
  if (/\bsalary|credited|received|deposit from|incoming\b/.test(normalized)) return 'income';
  if (/\btransfer|sent to|completed to\b/.test(normalized)) return 'transfer';
  if (/\bspent|paid|purchase|debited|withdrawn\b/.test(normalized)) return 'expense';
  return 'expense';
}

function extractParty(message: string, type: TransactionType) {
  const patterns =
    type === 'income'
      ? [/from\s+([A-Za-z][A-Za-z\s.&-]+?)(?:\s+on|\.|,|$)/i, /credited\s+by\s+([A-Za-z][A-Za-z\s.&-]+?)(?:\s+on|\.|,|$)/i]
      : type === 'transfer'
        ? [/to\s+([A-Za-z][A-Za-z\s.&-]+?)(?:\s+on|\.|,|$)/i]
        : [/at\s+([A-Za-z][A-Za-z\s.&-]+?)(?:\s+on|\.|,|$)/i, /for\s+([A-Za-z][A-Za-z\s.&-]+?)(?:\s+on|\.|,|$)/i];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return titleCase(match[1].trim());
  }

  if (/salary/i.test(message)) return 'Employer';
  return undefined;
}

function extractDate(message: string) {
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (!match?.[1]) continue;
    const parsed = new Date(match[1]);
    if (!Number.isNaN(parsed.getTime())) return toInputDate(parsed);
  }

  return toInputDate();
}

function scoreConfidence(message: string, merchant?: string) {
  let score = 0.55;
  if (amountPatterns.some((pattern) => pattern.test(message))) score += 0.2;
  if (merchant) score += 0.15;
  if (datePatterns.some((pattern) => pattern.test(message))) score += 0.1;
  return Math.min(score, 0.98);
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function typeLabel(type: TransactionType) {
  if (type === 'income') return 'Money received';
  if (type === 'expense') return 'Payment';
  if (type === 'savings') return 'Savings deposit';
  return 'Transfer';
}
