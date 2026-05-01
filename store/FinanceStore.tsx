import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { buildFinanceSummary, type FinanceSummary } from '@/lib/finance/analytics';
import { seedTransactions } from '@/lib/finance/seed';
import type { ParsedSmsTransaction, Transaction } from '@/lib/finance/types';

type ThemeMode = 'light' | 'dark';

type FinanceStore = {
  transactions: Transaction[];
  summary: FinanceSummary;
  themeMode: ThemeMode;
  colors: AppColors;
  addManualTransaction: (transaction: Omit<Transaction, 'id' | 'source'>) => void;
  addParsedTransactions: (transactions: ParsedSmsTransaction[]) => void;
  deleteTransaction: (id: string) => void;
  resetDemo: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

export type AppColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  muted: string;
  subtle: string;
  line: string;
  primary: string;
  primarySoft: string;
  positive: string;
  danger: string;
  warning: string;
  chip: string;
  tab: string;
};

const STORAGE_KEY = 'ethio-budget-native-transactions-v1';
const THEME_KEY = 'ethio-budget-native-theme-v1';

const palettes: Record<ThemeMode, AppColors> = {
  light: {
    background: '#F2F6F3',
    surface: '#FFFFFF',
    surfaceMuted: '#EAF1ED',
    text: '#0E1B18',
    muted: '#64746F',
    subtle: '#8B9A95',
    line: '#DDE7E2',
    primary: '#059669',
    primarySoft: '#DDF8EC',
    positive: '#0EA5A3',
    danger: '#E11D48',
    warning: '#D97706',
    chip: '#F8FAF9',
    tab: '#FFFFFF',
  },
  dark: {
    background: '#07120F',
    surface: '#0E1C18',
    surfaceMuted: '#132923',
    text: '#F8FFFC',
    muted: '#AABBB5',
    subtle: '#6F8580',
    line: '#1F3932',
    primary: '#34D399',
    primarySoft: '#12372E',
    positive: '#5EEAD4',
    danger: '#FB7185',
    warning: '#FBBF24',
    chip: '#10211D',
    tab: '#0B1714',
  },
};

const FinanceContext = createContext<FinanceStore | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const loadedTransactions = useRef(false);
  const loadedTheme = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!saved) return;
        const parsed = JSON.parse(saved) as Transaction[];
        if (Array.isArray(parsed)) setTransactions(parsed);
      })
      .catch(() => AsyncStorage.removeItem(STORAGE_KEY))
      .finally(() => {
        loadedTransactions.current = true;
      });

    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') setThemeModeState(saved);
      })
      .finally(() => {
        loadedTheme.current = true;
      });
  }, []);

  useEffect(() => {
    if (!loadedTransactions.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (!loadedTheme.current) return;
    AsyncStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode]);

  const addManualTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'source'>) => {
    setTransactions((current) => [{ ...transaction, id: createId(), source: 'manual' }, ...current]);
  }, []);

  const addParsedTransactions = useCallback((items: ParsedSmsTransaction[]) => {
    setTransactions((current) => [
      ...items.map((item) => ({
        ...item,
        id: createId(),
        source: 'sms' as const,
      })),
      ...current,
    ]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((current) => current.filter((item) => item.id !== id));
  }, []);

  const resetDemo = useCallback(() => {
    setTransactions(seedTransactions);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const value = useMemo<FinanceStore>(
    () => ({
      transactions: [...transactions].sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date))),
      summary: buildFinanceSummary(transactions),
      themeMode,
      colors: palettes[themeMode],
      addManualTransaction,
      addParsedTransactions,
      deleteTransaction,
      resetDemo,
      setThemeMode,
    }),
    [addManualTransaction, addParsedTransactions, deleteTransaction, resetDemo, setThemeMode, themeMode, transactions],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
