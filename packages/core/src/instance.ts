/**
 * Singleton instance of EventLog
 * Moved here to avoid circular dependencies
 */
import { createEventLog } from './core/eventlog';

export const eventLog = createEventLog();
