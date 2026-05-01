import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/lib/finance/format';
import { bankSmsSenders, scanBankSmsInbox, type SmsScanResult } from '@/lib/finance/smsInbox';
import { useFinance } from '@/store/FinanceStore';
import { Card, IconButton } from './ui';

export function SmsAccessPanel() {
  const { addParsedTransactions, colors } = useFinance();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<SmsScanResult | null>(null);

  async function scanInbox() {
    setIsScanning(true);
    try {
      const result = await scanBankSmsInbox();
      setScanResult(result);
      if (result.permission === 'denied') {
        Alert.alert('SMS access denied', 'Enable SMS permission in Android settings to scan CBE and 127 messages.');
      }
    } catch {
      Alert.alert('SMS scan failed', 'The native SMS reader could not scan the inbox on this device.');
    } finally {
      setIsScanning(false);
    }
  }

  function saveParsedTransactions() {
    if (!scanResult?.parsedTransactions.length) return;
    addParsedTransactions(scanResult.parsedTransactions);
    Alert.alert('Saved', `${scanResult.parsedTransactions.length} transactions were imported from SMS.`);
  }

  const unavailable =
    Platform.OS !== 'android'
      ? 'Live SMS inbox reading is Android-only. iOS and web do not allow apps to read SMS messages.'
      : scanResult?.permission === 'module-missing'
        ? 'This build does not include the native SMS reader. Create an Android development build after installing dependencies.'
        : null;

  return (
    <Card
      title="Live CBE / 127 SMS access"
      subtitle="Request Android SMS permission, scan the inbox, and only process messages sent by CBE or 127.">
      <View style={[styles.notice, { backgroundColor: colors.primarySoft, borderColor: `${colors.primary}55` }]}>
        <Ionicons color={colors.primary} name="shield-checkmark" size={20} />
        <Text style={[styles.noticeText, { color: colors.text }]}>
          Android permissions are broad, but Ethio Budget filters locally to sender IDs: {bankSmsSenders.join(', ')}.
        </Text>
      </View>

      <View style={styles.actions}>
        <IconButton
          disabled={isScanning || Boolean(unavailable)}
          icon="mail-open"
          label={isScanning ? 'Scanning...' : 'Request access & scan'}
          onPress={scanInbox}
        />
        <IconButton
          disabled={!scanResult?.parsedTransactions.length}
          icon="download"
          label="Save found"
          onPress={saveParsedTransactions}
          variant="secondary"
        />
      </View>

      {unavailable ? <Text style={[styles.helper, { color: colors.warning }]}>{unavailable}</Text> : null}

      {scanResult ? (
        <View style={styles.results}>
          <View style={[styles.resultGrid, { backgroundColor: colors.chip }]}>
            <ResultCell label="Scanned" value={String(scanResult.totalScanned)} />
            <ResultCell label="CBE / 127" value={String(scanResult.matchedMessages.length)} />
            <ResultCell label="Parsed" value={String(scanResult.parsedTransactions.length)} />
            <ResultCell label="Issues" value={String(scanResult.problems.length)} />
          </View>

          {scanResult.parsedTransactions.slice(0, 3).map((transaction, index) => (
            <View key={`${transaction.rawMessage}-${index}`} style={[styles.parsedItem, { borderColor: colors.line }]}>
              <Text style={[styles.parsedTitle, { color: colors.text }]}>{transaction.note}</Text>
              <Text style={[styles.parsedMeta, { color: colors.muted }]}>
                {transaction.category} · {transaction.type} · {formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))}

          {scanResult.problems.length ? (
            <View style={styles.problemList}>
              <Text style={[styles.problemHeading, { color: colors.text }]}>Messages needing review</Text>
              {scanResult.problems.slice(0, 4).map((problem) => (
                <View key={problem.id} style={[styles.problemItem, { backgroundColor: `${colors.danger}12` }]}>
                  <Text style={[styles.problemReason, { color: problem.severity === 'medium' ? colors.danger : colors.warning }]}>
                    {problem.sender} · {problem.reason}
                  </Text>
                  <Text numberOfLines={2} style={[styles.problemMessage, { color: colors.muted }]}>
                    {problem.message}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

function ResultCell({ label, value }: { label: string; value: string }) {
  const { colors } = useFinance();

  return (
    <View style={styles.resultCell}>
      <Text style={[styles.resultValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.resultLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 13,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  helper: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 12,
  },
  results: {
    gap: 12,
    marginTop: 15,
  },
  resultGrid: {
    borderRadius: 18,
    flexDirection: 'row',
    paddingVertical: 13,
  },
  resultCell: {
    alignItems: 'center',
    flex: 1,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  parsedItem: {
    borderBottomWidth: 1,
    paddingBottom: 11,
  },
  parsedTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  parsedMeta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  problemList: {
    gap: 9,
  },
  problemHeading: {
    fontSize: 14,
    fontWeight: '900',
  },
  problemItem: {
    borderRadius: 16,
    padding: 12,
  },
  problemReason: {
    fontSize: 12,
    fontWeight: '900',
  },
  problemMessage: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 5,
  },
});
