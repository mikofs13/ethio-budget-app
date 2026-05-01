import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

export type NativeSmsMessage = {
  id: string;
  address?: string | null;
  body?: string | null;
  date: number;
  read: number;
};

type EthioSmsReaderModule = {
  listInboxMessages: (maxCount: number) => Promise<NativeSmsMessage[]>;
};

let nativeModule: EthioSmsReaderModule | null = null;

if (Platform.OS === 'android') {
  try {
    nativeModule = requireNativeModule<EthioSmsReaderModule>('EthioSmsReader');
  } catch {
    nativeModule = null;
  }
}

export function isSmsReaderAvailable() {
  return Boolean(nativeModule?.listInboxMessages);
}

export async function listInboxMessages(maxCount = 500) {
  if (!nativeModule?.listInboxMessages) {
    throw new Error('EthioSmsReader native module is not available in this build.');
  }

  return nativeModule.listInboxMessages(maxCount);
}
