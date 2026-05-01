export type TransactionType = 'income' | 'expense' | 'transfer' | 'savings';

export type Category =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Salary'
  | 'Shopping'
  | 'Entertainment'
  | 'Savings'
  | 'Transfer'
  | 'Other';

export type TransactionSource = 'sms' | 'manual' | 'seed';

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  note: string;
  date: string;
  merchant?: string;
  source: TransactionSource;
  rawMessage?: string;
};

export type ParsedSmsTransaction = Omit<Transaction, 'id' | 'source'> & {
  confidence: number;
};

export const categories: Category[] = [
  'Food',
  'Transport',
  'Bills',
  'Salary',
  'Shopping',
  'Entertainment',
  'Savings',
  'Transfer',
  'Other',
];

export const transactionTypes: TransactionType[] = ['income', 'expense', 'transfer', 'savings'];
