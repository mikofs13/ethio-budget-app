import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatCurrency, formatDate } from '@/lib/finance/format';
import { sampleSmsMessages } from '@/lib/finance/mockSms';
import { parseSmsMessages } from '@/lib/finance/parser';
import { useFinance } from '@/store/FinanceStore';
import { Card, IconButton } from './ui';

export function SmsImportPanel() {
  const { addParsedTransactions, colors } = useFinance();
  const [text, setText] = useState(sampleSmsMessages.slice(0, 4).join('\n'));
  const parsed = useMemo(() => parseSmsMessages(text), [text]);

  async function importTextFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ['text/plain', 'text/*'],
      });

      if (result.canceled || !result.assets?.[0]) return;

      const fileText = await FileSystem.readAsStringAsync(result.assets[0].uri);
      setText(fileText);
    } catch {
      Alert.alert('Import failed', 'The selected file could not be read.');
    }
  }

  function addTransactions() {
    addParsedTransactions(parsed);
    Alert.alert('Transactions added', `${parsed.length} parsed SMS transactions were saved.`);
  }

  return (
    <Card
      title="SMS transaction parser"
      subtitle="Paste messages, import a .txt file, or load a realistic bank SMS dataset.">
      <View style={styles.actions}>
        <IconButton icon="sparkles" label="Samples" onPress={() => setText(sampleSmsMessages.join('\n'))} variant="secondary" />
        <IconButton icon="document-text" label="Import .txt" onPress={importTextFile} variant="secondary" />
      </View>
      <TextInput
        multiline
        onChangeText={setText}
        placeholder="Paste one bank SMS per line"
        placeholderTextColor={colors.subtle}
        style={[
          styles.textArea,
          {
            backgroundColor: colors.chip,
            borderColor: colors.line,
            color: colors.text,
          },
        ]}
        textAlignVertical="top"
        value={text}
      />
      <View style={styles.parseFooter}>
        <Text style={[styles.recognized, { color: colors.muted }]}>{parsed.length} recognized</Text>
        <IconButton disabled={parsed.length === 0} icon="checkmark-circle" label="Add parsed" onPress={addTransactions} />
      </View>
      <View style={styles.previewList}>
        {parsed.slice(0, 5).map((item, index) => (
          <View key={`${item.rawMessage}-${index}`} style={[styles.previewItem, { backgroundColor: colors.chip }]}>
            <View style={styles.previewTop}>
              <View style={styles.previewText}>
                <Text numberOfLines={1} style={[styles.previewMerchant, { color: colors.text }]}>
                  {item.merchant ?? item.category}
                </Text>
                <Text style={[styles.previewMeta, { color: colors.muted }]}>
                  {formatDate(item.date)} · {item.category} · {Math.round(item.confidence * 100)}%
                </Text>
              </View>
              <Text style={[styles.previewAmount, { color: item.type === 'income' ? colors.positive : colors.text }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
            <Text numberOfLines={2} style={[styles.raw, { color: colors.subtle }]}>
              {item.rawMessage}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  textArea: {
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    minHeight: 190,
    padding: 14,
  },
  parseFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
  },
  recognized: {
    fontSize: 13,
    fontWeight: '800',
  },
  previewList: {
    gap: 10,
    marginTop: 15,
  },
  previewItem: {
    borderRadius: 17,
    padding: 12,
  },
  previewTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  previewText: {
    flex: 1,
  },
  previewMerchant: {
    fontSize: 14,
    fontWeight: '900',
  },
  previewMeta: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  previewAmount: {
    fontSize: 13,
    fontWeight: '900',
  },
  raw: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
  },
});
