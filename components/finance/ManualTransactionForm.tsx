import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { categorizeTransaction } from '@/lib/finance/categorize';
import { toInputDate } from '@/lib/finance/format';
import { categories, transactionTypes, type Category, type TransactionType } from '@/lib/finance/types';
import { useFinance } from '@/store/FinanceStore';
import { Card, FieldLabel, IconButton, SegmentedControl } from './ui';

export function ManualTransactionForm() {
  const { addManualTransaction, colors } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toInputDate());

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);
    setCategory(categorizeTransaction(note, nextType));
  }

  function handleNoteChange(value: string) {
    setNote(value);
    setCategory(categorizeTransaction(value, type));
  }

  function submit() {
    const numericAmount = Number(amount.replaceAll(',', ''));
    if (!numericAmount || numericAmount <= 0) return;

    addManualTransaction({
      amount: numericAmount,
      type,
      category,
      note: note.trim() || `${category} ${type}`,
      date,
      merchant: note.trim() || undefined,
    });

    setAmount('');
    setNote('');
  }

  return (
    <Card title="Manual transaction" subtitle="Add income, expenses, transfers, and savings deposits.">
      <View style={styles.form}>
        <SegmentedControl options={transactionTypes} value={type} onChange={handleTypeChange} />
        <View style={styles.twoColumns}>
          <View style={styles.field}>
            <FieldLabel>Amount</FieldLabel>
            <TextInput
              keyboardType="numeric"
              onChangeText={setAmount}
              placeholder="ETB"
              placeholderTextColor={colors.subtle}
              style={[styles.input, { borderColor: colors.line, color: colors.text, backgroundColor: colors.chip }]}
              value={amount}
            />
          </View>
          <View style={styles.field}>
            <FieldLabel>Date</FieldLabel>
            <TextInput
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.subtle}
              style={[styles.input, { borderColor: colors.line, color: colors.text, backgroundColor: colors.chip }]}
              value={date}
            />
          </View>
        </View>
        <View>
          <FieldLabel>Category</FieldLabel>
          <View style={styles.categoryWrap}>
            {categories.map((item) => {
              const active = item === category;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  onPress={() => setCategory(item)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: active ? colors.primary : colors.chip,
                      borderColor: active ? colors.primary : colors.line,
                    },
                  ]}>
                  <Text style={[styles.categoryText, { color: active ? '#FFFFFF' : colors.muted }]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View>
          <FieldLabel>Note</FieldLabel>
          <TextInput
            onChangeText={handleNoteChange}
            placeholder="Lunch, salary, rent, taxi ride"
            placeholderTextColor={colors.subtle}
            style={[styles.input, { borderColor: colors.line, color: colors.text, backgroundColor: colors.chip }]}
            value={note}
          />
        </View>
        <IconButton disabled={!amount} icon="add-circle" label="Add transaction" onPress={submit} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '700',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
