import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { AppScreen, Card } from '@/components/finance/ui';
import { useFinance } from '@/store/FinanceStore';

export default function ModalScreen() {
  const { colors } = useFinance();

  return (
    <AppScreen
      eyebrow="MVP"
      subtitle="A native finance dashboard built for SMS parsing, manual records, analytics, and local persistence."
      title="Ethio Budget">
      <Card>
        <Text style={[styles.body, { color: colors.muted }]}>
          The app keeps business logic separate from presentation so the parser, categorizer, and insights engine can later connect to real APIs or native SMS permissions.
        </Text>
        <Link href="/" dismissTo style={[styles.link, { backgroundColor: colors.primary }]}>
          <Text style={styles.linkText}>Back to dashboard</Text>
        </Link>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 23,
  },
  link: {
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 18,
    paddingVertical: 14,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
