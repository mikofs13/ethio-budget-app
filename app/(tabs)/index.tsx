import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryBreakdown, InsightsPanel, TrendChart } from '@/components/finance/Charts';
import { TransactionRow } from '@/components/finance/TransactionRow';
import { AppScreen, Card, HeroCard, MetricCard } from '@/components/finance/ui';
import { formatCurrency } from '@/lib/finance/format';
import { useFinance } from '@/store/FinanceStore';

export default function HomeScreen() {
  const { colors, summary, themeMode, setThemeMode, transactions, resetDemo } = useFinance();
  const recent = transactions.slice(0, 4);

  return (
    <AppScreen
      eyebrow="Ethio Budget"
      subtitle="Personal finance from bank SMS and manual records."
      title="Your money, clearly tracked">
      <HeroCard
        balance={formatCurrency(summary.currentBalance)}
        label="Current balance"
        meta={`${summary.savingsRate}% savings rate · ${summary.highestSpendingCategory} leads spending`}
      >
        <View style={styles.heroActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            style={styles.heroButton}>
            <Ionicons color="#E7FFF4" name={themeMode === 'dark' ? 'sunny' : 'moon'} size={17} />
            <Text style={styles.heroButtonText}>{themeMode === 'dark' ? 'Light' : 'Dark'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={resetDemo} style={styles.heroButton}>
            <Ionicons color="#E7FFF4" name="refresh" size={17} />
            <Text style={styles.heroButtonText}>Reset</Text>
          </Pressable>
        </View>
      </HeroCard>

      <View style={styles.metricsGrid}>
        <MetricCard icon="arrow-down" label="Income this month" tone={colors.positive} value={formatCurrency(summary.incomeThisMonth)} />
        <MetricCard icon="arrow-up" label="Expenses this month" tone={colors.danger} value={formatCurrency(summary.expensesThisMonth)} />
        <MetricCard icon="shield-checkmark" label="Savings amount" tone={colors.primary} value={formatCurrency(summary.savingsThisMonth)} />
        <MetricCard icon="wallet" label="Suggested budget" tone={colors.warning} value={formatCurrency(summary.suggestedMonthlyBudget)} />
      </View>

      <TrendChart />
      <InsightsPanel />
      <CategoryBreakdown />

      <Card title="Recent transactions" subtitle="Latest SMS imports and manual activity.">
        {recent.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 40,
    paddingHorizontal: 13,
  },
  heroButtonText: {
    color: '#E7FFF4',
    fontSize: 13,
    fontWeight: '900',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
