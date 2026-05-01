import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type DimensionValue,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFinance, type AppColors } from '@/store/FinanceStore';

type IconName = keyof typeof Ionicons.glyphMap;

export function AppScreen({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { colors } = useFinance();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.screenContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({
  title,
  subtitle,
  action,
  children,
  style,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useFinance();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }, style]}>
      {title ? (
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleBlock}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function HeroCard({
  balance,
  label,
  meta,
  children,
}: {
  balance: string;
  label: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <LinearGradient colors={['#047857', '#0F766E', '#0E1B18']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View>
        <Text style={styles.heroLabel}>{label}</Text>
        <Text style={styles.heroBalance}>{balance}</Text>
        <Text style={styles.heroMeta}>{meta}</Text>
      </View>
      {children}
    </LinearGradient>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  icon?: IconName;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useFinance();
  const tone = getButtonTone(colors, variant, disabled);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tone.background, borderColor: tone.border, opacity: pressed ? 0.78 : 1 },
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={17} color={tone.text} /> : null}
      <Text style={[styles.buttonText, { color: tone.text }]}>{label}</Text>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labelFormatter = titleCase,
}: {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  labelFormatter?: (value: T) => string;
}) {
  const { colors } = useFinance();

  return (
    <View style={[styles.segmented, { backgroundColor: colors.surfaceMuted }]}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            onPress={() => onChange(option)}
            style={[
              styles.segment,
              active ? { backgroundColor: colors.primary } : { backgroundColor: 'transparent' },
            ]}>
            <Text style={[styles.segmentText, { color: active ? '#FFFFFF' : colors.muted }]}>{labelFormatter(option)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: IconName;
  tone: string;
}) {
  const { colors } = useFinance();

  return (
    <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${tone}22` }]}>
        <Ionicons name={icon} size={19} color={tone} />
      </View>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export function FieldLabel({ children, style }: { children: ReactNode; style?: TextStyle }) {
  const { colors } = useFinance();
  return <Text style={[styles.fieldLabel, { color: colors.text }, style]}>{children}</Text>;
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const { colors } = useFinance();
  const width = `${Math.max(0, Math.min(100, value))}%` as DimensionValue;

  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
      <View style={[styles.progressFill, { width, backgroundColor: color ?? colors.primary }]} />
    </View>
  );
}

function getButtonTone(colors: AppColors, variant: 'primary' | 'secondary' | 'danger', disabled?: boolean) {
  if (disabled) {
    return { background: colors.surfaceMuted, border: colors.line, text: colors.subtle };
  }

  if (variant === 'secondary') {
    return { background: colors.chip, border: colors.line, text: colors.text };
  }

  if (variant === 'danger') {
    return { background: `${colors.danger}16`, border: `${colors.danger}44`, text: colors.danger };
  }

  return { background: colors.primary, border: colors.primary, text: '#FFFFFF' };
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  screenContent: {
    gap: 18,
    padding: 18,
    paddingBottom: 104,
  },
  header: {
    gap: 6,
    paddingTop: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 33,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 39,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  hero: {
    borderRadius: 28,
    gap: 18,
    overflow: 'hidden',
    padding: 22,
  },
  heroLabel: {
    color: '#CFFAE7',
    fontSize: 13,
    fontWeight: '700',
  },
  heroBalance: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 43,
    marginTop: 7,
  },
  heroMeta: {
    color: '#BFE8D8',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 15,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  segmented: {
    borderRadius: 18,
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 8,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metric: {
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    minWidth: '47%',
    padding: 14,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    marginBottom: 13,
    width: 38,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  metricValue: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 5,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: 8,
  },
});
