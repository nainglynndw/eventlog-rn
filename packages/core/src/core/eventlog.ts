/**
 * Main EventLog API - Functional implementation with closures
 */

import type {
  EventLog,
  EventLogConfig,
  Event,
  Session,
  EventContext,
  ExportOptions,
  LogLevel,
  Result,
  StorageAdapter,
  EventQuery,
} from '../types';
import type { RingBufferState } from './buffer';
import {
  createEvent,
  createScreenPayload,
  createActionPayload,
  createLogPayload,
  createErrorPayload,
  incrementSeq,
  updateSessionActivity,
  createSession,
  sanitizeEvent,
  exportEventsAsJSONL,
} from './events';
import {
  createRingBuffer,
  pushEvent,
  toArray as bufferToArray,
  clearBuffer,
} from './buffer';
import { debounce } from './utils';
import { queryEvents } from './query';
import { internalStorage } from '../storage/mmkv';

/**
 * Internal state (encapsulated in closure)
 */
type InternalState = {
  config: EventLogConfig;
  session: Session;
  buffer: RingBufferState;
  context: EventContext;
  initialized: boolean;
};

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  SESSION: '@eventlog-rn/session',
  EVENTS: '@eventlog-rn/events',
} as const;

/**
 * Create EventLog instance (factory function with closure)
 */
export const createEventLog = (config: EventLogConfig = {}): EventLog => {
  // Mutable state (encapsulated in closure)
  let state: InternalState | null = null;
  let initPromise: Promise<Result<void>> | null = null;

  /**
   * Load session from storage
   */
  const loadSession = async (
    storage: StorageAdapter
  ): Promise<Session | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.SESSION);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as Session;
    } catch {
      return null;
    }
  };

  /**
   * Save session to storage
   */
  const saveSession = async (
    storage: StorageAdapter,
    session: Session
  ): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (error) {
      console.warn('[EventLog] Failed to save session:', error);
    }
  };

  /**
   * Load events from storage
   */
  const loadEvents = async (
    storage: StorageAdapter
  ): Promise<ReadonlyArray<Event>> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as ReadonlyArray<Event>;
    } catch {
      return [];
    }
  };

  /**
   * Save events to storage (debounced)
   */
  const saveEventsImmediate = async (
    storage: StorageAdapter,
    events: ReadonlyArray<Event>
  ): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (error) {
      console.warn('[EventLog] Failed to save events:', error);
    }
  };

  const saveEvents = debounce(
    (storage: StorageAdapter, events: ReadonlyArray<Event>) => {
      saveEventsImmediate(storage, events);
    },
    config.batchWriteDelayMs ?? 100
  );

  /**
   * Auto-detect device info
   */
  const autoDetectDeviceInfo = (): Readonly<Record<string, unknown>> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Platform, Dimensions } = require('react-native');

      return {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        screenWidth: Dimensions.get('window').width,
        screenHeight: Dimensions.get('window').height,
      } as const;
    } catch {
      return {} as const;
    }
  };

  /**
   * Initialize
   */
  const init = async (runtimeConfig?: Partial<EventLogConfig>): Promise<Result<void>> => {
    // Merge runtime config with initial config
    if (runtimeConfig) {
      Object.assign(config, runtimeConfig);
    }

    if (state?.initialized) {
      return { ok: true, value: undefined } as const;
    }

    if (initPromise) {
      return initPromise;
    }

    initPromise = (async (): Promise<Result<void>> => {
      try {
        console.log('[EventLog] Starting initialization...');

        // Load or create session
        const savedSession = await loadSession(internalStorage);
        const now = Date.now();
        const timeoutMs = (config.sessionTimeoutMinutes ?? 30) * 60 * 1000;

        const session: Session =
          savedSession && now - savedSession.lastActivityTime < timeoutMs
            ? { ...savedSession, startType: 'warm' as const }
            : createSession('cold');

        // Load events
        const events = await loadEvents(internalStorage);
        let buffer = createRingBuffer(config.maxEvents ?? 1000);

        // Filter old events and populate buffer
        const maxAge = (config.maxAgeDays ?? 7) * 24 * 60 * 60 * 1000;
        events.forEach((event) => {
          if (now - event.timestamp < maxAge) {
            buffer = pushEvent(buffer, event);
          }
        });

        // Auto-detect device info
        const deviceInfo = autoDetectDeviceInfo();

        // Initialize state
        state = {
          config,
          session,
          buffer,
          context: { deviceInfo } as const,
          initialized: true,
        };

        await saveSession(internalStorage, session);
        console.log('[EventLog] Initialization complete!');

        return { ok: true, value: undefined } as const;
      } catch (error) {
        console.error('[EventLog] Initialization failed:', error);
        return {
          ok: false,
          error: error instanceof Error ? error : new Error(String(error)),
        } as const;
      }
    })();

    return initPromise;
  };

  /**
   * Check if ready
   */
  const isReady = (): boolean => {
    return state?.initialized ?? false;
  };

  /**
   * Log event (internal helper)
   */
  const logEvent = (
    category: Parameters<typeof createEvent>[2],
    payload: unknown
  ): Result<void> => {
    if (!state?.initialized) {
      return {
        ok: false,
        error: new Error('[EventLog] Not initialized. Call init() first.'),
      } as const;
    }

    try {
      // Create event
      let event = createEvent(state.session, state.context, category, payload);

      // Sanitize
      event = sanitizeEvent(event);

      // Apply custom sanitizer if provided
      if (state.config.sanitize) {
        event = state.config.sanitize(event);
      }

      // Update buffer
      state.buffer = pushEvent(state.buffer, event);

      // Update session
      state.session = incrementSeq(state.session);
      state.session = updateSessionActivity(state.session);

      // Save to storage (debounced)
      const events = bufferToArray(state.buffer);
      saveEvents(internalStorage, events);
      saveSession(internalStorage, state.session);

      console.log(`[EventLog] Event logged: ${category}`);

      return { ok: true, value: undefined } as const;
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      } as const;
    }
  };

  /**
   * Public API
   */
  return {
    init,
    isReady,

    screen: (name: string, params?: unknown): Result<void> => {
      return logEvent('screen', createScreenPayload(name, params));
    },

    action: (name: string, data?: unknown): Result<void> => {
      return logEvent('action', createActionPayload(name, data));
    },

    log: (level: LogLevel, message: string, data?: unknown): Result<void> => {
      return logEvent('log', createLogPayload(level, message, data));
    },

    error: (error: unknown, context?: unknown): Result<void> => {
      return logEvent('error', createErrorPayload(error, context));
    },

    setUser: (user: Readonly<Record<string, unknown>>): void => {
      if (state) {
        state.context = { ...state.context, user } as const;
      }
    },

    setContext: (key: string, value: unknown): void => {
      if (state) {
        state.context = { ...state.context, [key]: value } as const;
      }
    },

    setDeviceInfo: (info: Readonly<Record<string, unknown>>): void => {
      if (state) {
        state.context = { ...state.context, deviceInfo: info } as const;
      }
    },

    export: async (options: ExportOptions): Promise<Result<string>> => {
      if (!state?.initialized) {
        return {
          ok: false,
          error: new Error('[EventLog] Not initialized'),
        } as const;
      }

      try {
        // Flush pending writes
        const events = bufferToArray(state.buffer);
        await saveEventsImmediate(internalStorage, events);

        console.log(`[EventLog] Exporting ${events.length} events`);

        const jsonl = exportEventsAsJSONL(events, options.mode);
        return { ok: true, value: jsonl } as const;
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error : new Error(String(error)),
        } as const;
      }
    },

    clear: async (): Promise<Result<void>> => {
      if (!state?.initialized) {
        return {
          ok: false,
          error: new Error('[EventLog] Not initialized'),
        } as const;
      }

      try {
        state.buffer = clearBuffer(state.buffer);
        state.context = {} as const;

        await internalStorage.removeItem(STORAGE_KEYS.EVENTS);

        return { ok: true, value: undefined } as const;
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error : new Error(String(error)),
        } as const;
      }
    },

    getEvents: (): Result<ReadonlyArray<Event>> => {
      if (!state?.initialized) {
        return {
          ok: false,
          error: new Error('[EventLog] Not initialized'),
        } as const;
      }

      return { ok: true, value: bufferToArray(state.buffer) } as const;
    },

    query: (query: EventQuery): Result<ReadonlyArray<Event>> => {
      if (!state?.initialized) {
        return {
          ok: false,
          error: new Error('[EventLog] Not initialized'),
        } as const;
      }

      try {
        const events = bufferToArray(state.buffer);
        const filtered = queryEvents(events, query);
        return { ok: true, value: filtered } as const;
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error : new Error(String(error)),
        } as const;
      }
    },
  } as const;
};
