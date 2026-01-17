/**
 * @eventlog-rn/core
 * Functional, type-safe event logging SDK for React Native
 */

export { createEventLog } from './core/eventlog';
export type {
  EventLog,
  EventLogConfig,
  Event,
  EventCategory,
  EventContext,
  Session,
  ExportOptions,
  LogLevel,
  Result,
  StorageAdapter,
  NetworkEventPayload,
  ErrorEventPayload,
  EventQuery,
} from './types';

/**
 * Default singleton instance
 * 
 * Usage:
 * ```typescript
 * import { eventLog } from '@eventlog-rn/core';
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * 
 * await eventLog.init({ storage: AsyncStorage });
 * eventLog.screen('Home');
 * ```
 */
import { createEventLog } from './core/eventlog';
export const eventLog = createEventLog();
