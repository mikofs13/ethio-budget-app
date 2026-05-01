import { StyleSheet, Text, View } from 'react-native';

import { formatCompactCurrency, formatCurrency } from '@/lib/finance/format';
import { categories } from '@/lib/finance/types';
import { useFinance } from '@/store/FinanceStore';
import { Card, ProgressBar } from './ui';

export function TrendChart() {
  const { colors, summary } = useFinance();
  const max = Math.max(...summary.trend.flatMap((item) => [item.income, item.expense]), 1);

  return (
    <Card title="Spending trends" subtitle="Income and expenses across the last six months.">
      <View style={styles.chart}>
        {summary.trend.map((item) => (
          <View key={item.label} style={styles.trendGroup}>
            <View style={styles.barArea}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(5, (item.income / max) * 100)}%`,
                    backgroundColor: colors.positive,
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(5, (item.expense / max) * 100)}%`,
                    backgroundColor: colors.danger,
                  },
                ]}
              />
            </View>
            <Text style={[styles.axisLabel, { color: colors.muted }]}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <LegendDot color={colors.positive} label="Income" />
        <LegendDot color={colors.danger} label="Expense" />
      </View>
    </Card>
  );
}

export function CategoryBreakdown() {
  const { colors, summary } = useFinance();
  const max = Math.max(...Object.values(summary.categoryTotals), 1);

  return (
    <Card title="Category breakdown" subtitle="This month by spending category.">
      <View style={styles.categoryList}>
        {categories.map((category) => {
          const value = summary.categoryTotals[category];
          return (
            <View key={category} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
                <Text style={[styles.categoryValue, { color: colors.muted }]}>{formatCompactCurrency(value)}</Text>
              </View>
              <ProgressBar value={(value / max) * 100} color={category === 'Savings' ? colors.primary : colors.positive} />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

export function InsightsPanel() {
  const { colors, summary } = useFinance();
  const insights = [
    ['Highest category', summary.highestSpendingCategory],
    ['Daily average', formatCurrency(summary.dailyAverageSpending)],
    ['Income vs expense', `${formatCompactCurrency(summary.incomeThisMonth)} / ${formatCompactCurrency(summary.expensesThisMonth)}`],
    ['Savings rate', `${summary.savingsRate}%`],
    ['Budget suggestion', formatCurrency(summary.suggestedMonthlyBudget)],
  ];

  return (
    <Card title="Insights engine" subtitle="Fast analytics from SMS and manual transactions.">
      <View
        style={[
          styles.warning,
          {
            backgroundColor: summary.warning ? `${colors.danger}14` : `${colors.primary}16`,
            borderColor: summary.warning ? `${colors.danger}44` : `${colors.primary}44`,
          },
        ]}>
        <Text style={[styles.warningText, { color: summary.warning ? colors.danger : colors.primary }]}>
          {summary.warning ?? 'Spending is below income. Keep the savings habit steady.'}
        </Text>
      </View>
      <View style={styles.insightList}>
        {insights.map(([label, value]) => (
          <View key={label} style={[styles.insightRow, { backgroundColor: colors.chip }]}>
            <Text style={[styles.insightLabel, { color: colors.muted }]}>{label}</Text>
            <Text style={[styles.insightValue, { color: colors.text }]}>{value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const { colors } = useFinance();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    height: 190,
  },
  trendGroup: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    height: '100%',
  },
  barArea: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    width: '100%',
  },
  bar: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxWidth: 16,
    minHeight: 5,
    width: '38%',
  },
  axisLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  legend: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 16,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  legendDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryList: {
    gap: 13,
  },
  categoryRow: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '800',
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  warning: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 13,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
  },
  insightList: {
    gap: 9,
    marginTop: 12,
  },
  insightRow: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  insightValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
});
