import type { Category, TransactionType } from './types';

const categoryKeywords: Record<Category, string[]> = {
  Food: ['restaurant', 'cafe', 'coffee', 'supermarket', 'shoa', 'market', 'food', 'lunch', 'dinner', 'grocery'],
  Transport: ['fuel', 'taxi', 'ride', 'transport', 'bus', 'parking', 'train', 'ride share'],
  Bills: ['electric', 'utility', 'water', 'telecom', 'internet', 'bill', 'dstv', 'rent', 'airtime'],
  Salary: ['salary', 'payroll', 'wage', 'credited'],
  Shopping: ['mall', 'shop', 'store', 'boutique', 'clothes', 'pharmacy', 'marketplace'],
  Entertainment: ['cinema', 'movie', 'concert', 'game', 'netflix', 'music', 'ticket'],
  Savings: ['saving', 'savings', 'deposit'],
  Transfer: ['transfer', 'sent', 'completed'],
  Other: [],
};

export function categorizeTransaction(text: string, type: TransactionType): Category {
  const normalized = text.toLowerCase();

  if (type === 'savings') return 'Savings';
  if (type === 'transfer') return 'Transfer';

  for (const [category, keywords] of Object.entries(categoryKeywords) as [Category, string[]][]) {
    if (category === 'Other') continue;
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }

  return type === 'income' && normalized.includes('salary') ? 'Salary' : 'Other';
}
