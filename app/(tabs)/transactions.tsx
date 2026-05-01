import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TransactionRow } from '@/components/finance/TransactionRow';
import { AppScreen, Card, SegmentedControl } from '@/components/finance/ui';
import { formatCurrency } from '@/lib/finance/format';
import { transactionTypes, type TransactionType } from '@/lib/finance/types';
import { useFinance } from '@/store/FinanceStore';

type Filter = 'all' | TransactionType;

const filters: Filter[] = ['all', ...transactionTypes];

export default function TransactionsScreen() {
  const { colors, deleteTransaction, transactions } = useFinance();
  const [filter, setFilter] = useState<Filter>('all');
  const filtered = useMemo(
    () => (filter === 'all' ? transactions : transactions.filter((item) => item.type === filter)),
    [filter, transactions],
  );
  const total = filtered.reduce((sum, item) => sum + item.amount, 0);

  return (
    <AppScreen
      eyebrow="Activity"
      subtitle="Review, filter, and remove records from the local ledger."
      title="Transactions">
      <Card>
        <SegmentedControl options={filters} value={filter} onChange={setFilter} />
        <View style={[styles.summaryStrip, { backgroundColor: colors.chip }]}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>Filtered total</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={[styles.summaryCount, { color: colors.primary }]}>{filtered.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>records</Text>
          </View>
        </View>
      </Card>

      <Card title="Ledger" subtitle="Newest records appear first.">
        {filtered.map((transaction) => (
          <TransactionRow key={transaction.id} onDelete={deleteTransaction} transaction={transaction} />
        ))}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summaryStrip: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: '900',
  },
});
