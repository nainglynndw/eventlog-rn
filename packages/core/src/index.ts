/**
 * eventlog-rn
 * Functional, type-safe event logging SDK for React Native
 */

export { createEventLog } from './core/eventlog';
export { EventLogViewer } from './viewer/EventLogViewer';
export type { EventLogViewerProps } from './viewer/types';
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
 * import { eventLog } from 'eventlog-rn';
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * 
 * await eventLog.init({ storage: AsyncStorage });
 * eventLog.screen('Home');
 * ```
 */
import { eventLog } from './instance';
export { eventLog };
export { EventLogErrorBoundary } from './components/EventLogErrorBoundary';
