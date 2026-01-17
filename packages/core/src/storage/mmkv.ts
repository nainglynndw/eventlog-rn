/**
 * Internal MMKV storage adapter
 * Supports MMKV v2+ (RN 0.70+), v3 (RN 0.74+), and v4 (RN 0.75+)
 * MMKV is synchronous, but we wrap it in Promises to match StorageAdapter interface
 */

import type { StorageAdapter } from '../types';

// Detect and initialize MMKV with version compatibility
import * as MMKVModule from 'react-native-mmkv';

let mmkv: any;

try {
  // Handle ESM vs CJS
  const m = (MMKVModule as any)?.default ? (MMKVModule as any).default : MMKVModule;

  if (typeof (m as any).createMMKV === 'function') {
    // v4 API
    mmkv = (m as any).createMMKV({ id: 'eventlog-rn' });

  } else if (typeof (m as any).MMKV === 'function') {
    // v3 API
    mmkv = new (m as any).MMKV({ id: 'eventlog-rn' });

  } else if (typeof m === 'function') {
    // v2/v3 fallback (default export)
    mmkv = new (m as any)({ id: 'eventlog-rn' });

  } else {
    throw new Error('MMKV module found but no valid constructor (createMMKV or class MMKV) found.');
  }
} catch (error: any) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  throw new Error(
    `[EventLog] Failed to initialize MMKV: ${errorMessage}.`
  );
}

export const internalStorage: StorageAdapter = {
  setItem: async (key: string, value: string): Promise<void> => {
    mmkv.set(key, value);
  },

  getItem: async (key: string): Promise<string | null> => {
    return mmkv.getString(key) ?? null;
  },

  removeItem: async (key: string): Promise<void> => {
    // v4 uses remove(), v3 uses delete()
    if (typeof mmkv.remove === 'function') {
      mmkv.remove(key);
    } else {
      mmkv.delete(key);
    }
  },
};
