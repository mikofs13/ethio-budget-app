import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency, formatDate } from '@/lib/finance/format';
import type { Transaction, TransactionType } from '@/lib/finance/types';
import { useFinance } from '@/store/FinanceStore';

type IconName = keyof typeof Ionicons.glyphMap;

const typeIcons: Record<TransactionType, IconName> = {
  income: 'arrow-down-circle',
  expense: 'card',
  transfer: 'swap-horizontal',
  savings: 'shield-checkmark',
};

export function TransactionRow({
  transaction,
  onDelete,
}: {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}) {
  const { colors } = useFinance();
  const isPositive = transaction.type === 'income';
  const amountColor = isPositive ? colors.positive : transaction.type === 'savings' ? colors.primary : colors.text;

  return (
    <View style={[styles.row, { borderColor: colors.line }]}>
      <View style={[styles.icon, { backgroundColor: isPositive ? `${colors.positive}1F` : colors.surfaceMuted }]}>
        <Ionicons name={typeIcons[transaction.type]} size={20} color={amountColor} />
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} style={[styles.note, { color: colors.text }]}>
          {transaction.note}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          {transaction.category} · {formatDate(transaction.date)} · {transaction.source}
        </Text>
      </View>
      <View style={styles.amountBlock}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isPositive ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
        {onDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${transaction.note}`}
            hitSlop={10}
            onPress={() => onDelete(transaction.id)}
            style={styles.deleteButton}>
            <Ionicons name="close" size={17} color={colors.subtle} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  note: {
    fontSize: 14,
    fontWeight: '800',
  },
  meta: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    fontSize: 13,
    fontWeight: '900',
  },
  deleteButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
});
