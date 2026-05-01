import { ManualTransactionForm } from '@/components/finance/ManualTransactionForm';
import { SmsAccessPanel } from '@/components/finance/SmsAccessPanel';
import { SmsImportPanel } from '@/components/finance/SmsImportPanel';
import { AppScreen } from '@/components/finance/ui';

export default function ImportScreen() {
  return (
    <AppScreen
      eyebrow="Capture"
      subtitle="Turn pasted or imported bank alerts into categorized records, then add anything cash-based manually."
      title="Import transactions">
      <SmsAccessPanel />
      <SmsImportPanel />
      <ManualTransactionForm />
    </AppScreen>
  );
}
