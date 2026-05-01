import { monthKey, monthLabel } from "./format";
import type { Category, Transaction } from "./types";

export type FinanceSummary = {
  currentBalance: number;
  incomeThisMonth: number;
  expensesThisMonth: number;
  savingsThisMonth: number;
  savingsRate: number;
  dailyAverageSpending: number;
  highestSpendingCategory: Category;
  suggestedMonthlyBudget: number;
  categoryTotals: Record<Category, number>;
  trend: { label: string; income: number; expense: number }[];
  warning?: string;
};

export function buildFinanceSummary(
  transactions: Transaction[],
  now = new Date(),
): FinanceSummary {
  const activeMonth = monthKey(now);
  const thisMonth = transactions.filter(
    (item) => monthKey(new Date(item.date)) === activeMonth,
  );
  const incomeThisMonth = sumByType(thisMonth, "income");
  const expensesThisMonth = sumByType(thisMonth, "expense");
  const savingsThisMonth = sumByType(thisMonth, "savings");
  const currentBalance = transactions.reduce((balance, item) => {
    if (item.type === "income") return balance + item.amount;
    if (item.type === "expense" || item.type === "savings")
      return balance - item.amount;
    return balance;
  }, 0);
  const categoryTotals = buildCategoryTotals(thisMonth);
  const highestSpendingCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0] as Category;
  const daysElapsed = Math.max(1, now.getDate());
  const savingsRate =
    incomeThisMonth > 0
      ? Math.round((savingsThisMonth / incomeThisMonth) * 100)
      : 0;
  const suggestedMonthlyBudget = Math.max(
    0,
    Math.round((incomeThisMonth - savingsThisMonth) * 0.72),
  );

  return {
    currentBalance,
    incomeThisMonth,
    expensesThisMonth,
    savingsThisMonth,
    savingsRate,
    dailyAverageSpending: Math.round(expensesThisMonth / daysElapsed),
    highestSpendingCategory: highestSpendingCategory ?? "Other",
    suggestedMonthlyBudget,
    categoryTotals,
    trend: buildTrend(transactions, now),
    warning:
      expensesThisMonth > incomeThisMonth
        ? "Expenses are higher than income this month. Tighten variable spending until income catches up."
        : undefined,
  };
}

function sumByType(transactions: Transaction[], type: Transaction["type"]) {
  return transactions
    .filter((item) => item.type === type)
    .reduce((total, item) => total + item.amount, 0);
}

function buildCategoryTotals(transactions: Transaction[]) {
  const totals = {
    Food: 0,
    Transport: 0,
    Bills: 0,
    Salary: 0,
    Shopping: 0,
    Entertainment: 0,
    Savings: 0,
    Transfer: 0,
    Other: 0,
  } satisfies Record<Category, number>;

  for (const transaction of transactions) {
    if (transaction.type === "expense" || transaction.type === "savings") {
      totals[transaction.category] += transaction.amount;
    }
  }

  return totals;
}

function buildTrend(transactions: Transaction[], now: Date) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = monthKey(date);
    const monthly = transactions.filter(
      (item) => monthKey(new Date(item.date)) === key,
    );

    return {
      label: monthLabel(date),
      income: sumByType(monthly, "income"),
      expense: sumByType(monthly, "expense"),
    };
  });
}
