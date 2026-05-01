import { PermissionsAndroid, Platform } from 'react-native';
import { isSmsReaderAvailable, listInboxMessages } from 'ethio-sms-reader';
import type { NativeSmsMessage } from 'ethio-sms-reader';

import { parseSmsMessage } from './parser';
import type { ParsedSmsTransaction } from './types';

export type SmsPermissionState = 'granted' | 'denied' | 'unavailable' | 'module-missing';

export type InboxSmsMessage = {
  id?: string;
  address?: string | null;
  body?: string | null;
  date?: number;
  read?: number;
};

export type SmsProblem = {
  id: string;
  sender: string;
  severity: 'medium' | 'low';
  reason: string;
  message: string;
};

export type SmsScanResult = {
  permission: SmsPermissionState;
  totalScanned: number;
  matchedMessages: InboxSmsMessage[];
  parsedTransactions: ParsedSmsTransaction[];
  problems: SmsProblem[];
};

export const bankSmsSenders = ['CBE', '127'];

export async function requestSmsReadPermission(): Promise<SmsPermissionState> {
  if (Platform.OS !== 'android') return 'unavailable';
  if (!isSmsReaderAvailable()) return 'module-missing';

  const alreadyGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
  if (alreadyGranted) return 'granted';

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS, {
    title: 'Read CBE and 127 SMS messages',
    message:
      'Ethio Budget needs SMS read access to scan your inbox for CBE and 127 bank alerts. Only matching sender messages are processed inside the app.',
    buttonPositive: 'Allow scan',
    buttonNegative: 'Not now',
    buttonNeutral: 'Ask later',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
}

export async function scanBankSmsInbox(maxCount = 500): Promise<SmsScanResult> {
  const permission = await requestSmsReadPermission();
  if (permission !== 'granted') {
    return {
      permission,
      totalScanned: 0,
      matchedMessages: [],
      parsedTransactions: [],
      problems: [],
    };
  }

  const inboxMessages = (await listInboxMessages(maxCount)).map(mapInboxMessage);
  const matchedMessages = inboxMessages.filter((message) => isBankSender(message.address));
  const parsedTransactions: ParsedSmsTransaction[] = [];
  const problems: SmsProblem[] = [];

  for (const message of matchedMessages) {
    const body = message.body?.trim();
    const sender = message.address ?? 'Unknown';

    if (!body) {
      problems.push({
        id: message.id ?? `${sender}-${message.date ?? Date.now()}`,
        sender,
        severity: 'medium',
        reason: 'Empty SMS body',
        message: 'This bank SMS matched the sender filter but had no readable text.',
      });
      continue;
    }

    const parsed = parseSmsMessage(body);
    if (!parsed) {
      problems.push({
        id: message.id ?? `${sender}-${message.date ?? Date.now()}`,
        sender,
        severity: 'medium',
        reason: 'Could not parse transaction',
        message: body,
      });
      continue;
    }

    parsedTransactions.push(parsed);

    if (parsed.confidence < 0.75) {
      problems.push({
        id: message.id ?? `${sender}-${message.date ?? Date.now()}`,
        sender,
        severity: 'low',
        reason: 'Low parser confidence',
        message: body,
      });
    }
  }

  return {
    permission,
    totalScanned: inboxMessages.length,
    matchedMessages,
    parsedTransactions,
    problems,
  };
}

function mapInboxMessage(message: NativeSmsMessage): InboxSmsMessage {
  return {
    id: message.id,
    address: message.address,
    body: message.body,
    date: message.date,
    read: message.read,
  };
}

function isBankSender(sender?: string | null) {
  if (!sender) return false;
  const normalized = sender.replace(/\s+/g, '').toUpperCase();
  return bankSmsSenders.some((bankSender) => normalized === bankSender || normalized.includes(bankSender));
}
