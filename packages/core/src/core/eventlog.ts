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
import { enableNetworkInterception } from './network';
import { enableGlobalErrorLogging } from './errors';
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
  SESSION: 'eventlog-rn/session',
  EVENTS: 'eventlog-rn/events',
} as const;

/**
 * Create EventLog instance (factory function with closure)
 */
export const createEventLog = (config: EventLogConfig = {}): EventLog => {
  // Mutable state (encapsulated in closure)
  let state: InternalState | null = null;
  let initPromise: Promise<Result<void>> | null = null;

  // Pre-init queue
  let preInitQueue: Array<{
    category: Parameters<typeof createEvent>[2];
    payload: unknown;
  }> = [];

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
        
        // Flush pre-init queue
        if (preInitQueue.length > 0) {

            preInitQueue.forEach(item => {
                logEvent(item.category, item.payload);
            });
            preInitQueue = [];
        }

        // Enable network interception (default to true if config provided, or just default enabled?)
        // User requested: "default as network.enabled" and "it should be default true"
        // Interpreting as: If features.network is present, it defaults to enabled.
        // Actually, if we want it DEFAULT ENABLED even without config, we should check that.
        // But usually libraries are opt-in. However, user said "api log... should be default as network.enabled".
        // And "remove navigation features config. it should be default true".
        // Let's make network enabled by default if the user passes `features: {}` or even no features?
        // Let's stick to: If features.network is typically passed, enabled defaults to true.
        // Actually, let's just default it to TRUE if config.features?.network is defined.
        
        // Network logging is Enabled by Default
        const networkConfig = config.features?.network ?? { enabled: true };
        
        if (networkConfig.enabled !== false) {
             const proxyConfig = { 
               ...networkConfig, 
               enabled: true 
             }; // Ensure enabled is true for the interceptor

             const networkProxy = {
               log: (level: LogLevel, message: string, data?: unknown) => logEvent('log', createLogPayload(level, message, data)),
               error: (error: unknown, context?: unknown) => logEvent('error', createErrorPayload(error, context)),
               network: (payload: any) => logEvent('network', payload),
            } as unknown as EventLog;
            
            enableNetworkInterception(networkProxy, proxyConfig);
        }
        
        // Global Error Logging (Enabled by Default)
        const globalErrorsConfig = config.features?.globalErrors ?? { enabled: true };
        if (globalErrorsConfig.enabled !== false) {
             const errorProxy = {
                error: (error: unknown, context?: unknown) => logEvent('error', createErrorPayload(error, context)),
             } as unknown as EventLog;
             
             enableGlobalErrorLogging(errorProxy, { ...globalErrorsConfig, enabled: true });
        }
        


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
        // Queue event if not initialized
        preInitQueue.push({ category, payload });

        return { ok: true, value: undefined } as const;
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

      const events = bufferToArray(state.buffer);
      return { ok: true, value: events } as const;
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

    network: (payload: any): Result<void> => {
        return logEvent('network', payload);
    },
  } as const;
};
