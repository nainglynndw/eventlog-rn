/**
 * Type definitions for eventlog-rn/core
 * Strict, immutable types following functional programming principles
 */

/**
 * Storage adapter interface (AsyncStorage-compatible)
 */
export type StorageAdapter = Readonly<{
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}>;

/**
 * Event categories
 */
export type EventCategory = "screen" | "action" | "network" | "error" | "log";

/**
 * Log levels
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Event context (attached to all events)
 */
export type EventContext = Readonly<{
  readonly user?: Readonly<Record<string, unknown>>;
  readonly deviceInfo?: Readonly<Record<string, unknown>>;
  readonly [key: string]: unknown;
}>;

/**
 * Immutable event structure
 */
export type Event = Readonly<{
  readonly eventId: string;
  readonly sessionId: string;
  readonly seq: number;
  readonly timestamp: number;
  readonly timestampISO: string;
  readonly timezone: string;
  readonly category: EventCategory;
  readonly payload: unknown;
  readonly context: EventContext;
}>;

/**
 * Session information
 */
export type Session = Readonly<{
  readonly sessionId: string;
  readonly sessionStart: number;
  readonly startType: "cold" | "warm";
  readonly seq: number;
  readonly lastActivityTime: number;
}>;

/**
 * Feature configuration
 */
export type FeatureConfig = Readonly<{
  readonly network?: Readonly<{
    readonly enabled?: boolean;
    readonly interceptFetch?: boolean;
    readonly interceptAxios?: boolean;
    readonly logRequestBody?: boolean;
    readonly logResponseBody?: boolean;
    readonly maxBodySize?: number;
    readonly redactHeaders?: ReadonlyArray<string>;
  }>;
  readonly globalErrors?: Readonly<{
    readonly enabled?: boolean;
  }>;
}>;

/**
 * Tracker configuration
 */
export type EventLogConfig = Readonly<{
  readonly apiKey?: string;
  readonly autoDetect?: boolean;
  readonly maxEvents?: number;
  readonly maxAgeDays?: number;
  readonly sessionTimeoutMinutes?: number;
  readonly batchWriteDelayMs?: number;
  readonly sanitize?: (event: Event) => Event;
  readonly features?: FeatureConfig;
}>;

/**
 * Export options
 */
export type ExportOptions = Readonly<{
  readonly mode: "repro" | "full";
}>;

/**
 * Network event payload
 */
export type NetworkEventPayload = Readonly<{
  readonly url: string;
  readonly method: string;
  readonly status?: number;
  readonly duration?: number;
  readonly error?: string;
  readonly requestHeaders?: Readonly<Record<string, string>>;
  readonly responseHeaders?: Readonly<Record<string, string>>;
  readonly requestBody?: unknown;
  readonly responseBody?: unknown;
}>;

/**
 * Error event payload
 */
export type ErrorEventPayload = Readonly<{
  readonly message: string;
  readonly stack?: string;
  readonly isFatal?: boolean;
  readonly context?: unknown;
}>;

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | Readonly<{ readonly ok: true; readonly value: T }>
  | Readonly<{ readonly ok: false; readonly error: E }>;

/**
 * Event query for filtering
 */
export type EventQuery = Readonly<{
  readonly category?: ReadonlyArray<EventCategory>;
  readonly timeRange?: Readonly<{
    readonly start: number;
    readonly end: number;
  }>;
  readonly sessionId?: string;
  readonly search?: string;
  readonly limit?: number;
}>;

/**
 * EventLog API
 */
export type EventLog = Readonly<{
  readonly init: (config?: Partial<EventLogConfig>) => Promise<Result<void>>;
  readonly isReady: () => boolean;
  readonly screen: (name: string, params?: unknown) => Result<void>;
  readonly action: (name: string, data?: unknown) => Result<void>;
  readonly log: (
    level: LogLevel,
    message: string,
    data?: unknown,
  ) => Result<void>;
  readonly error: (error: unknown, context?: unknown) => Result<void>;
  readonly setUser: (user: Readonly<Record<string, unknown>>) => void;
  readonly setContext: (key: string, value: unknown) => void;
  readonly setDeviceInfo: (info: Readonly<Record<string, unknown>>) => void;
  readonly export: (options: ExportOptions) => Promise<Result<string>>;
  readonly clear: () => Promise<Result<void>>;
  readonly getEvents: () => Result<ReadonlyArray<Event>>;
  readonly query: (query: EventQuery) => Result<ReadonlyArray<Event>>;
  readonly network: (payload: NetworkEventPayload) => Result<void>;
}>;
