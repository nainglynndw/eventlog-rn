# TypeScript Types

Complete type reference for `eventlog-rn/core`.

## Event

```typescript
type Event = Readonly<{
  readonly eventId: string;           // UUID v4
  readonly sessionId: string;         // UUID v4
  readonly seq: number;               // Monotonic sequence within session
  readonly timestamp: number;         // Unix timestamp (ms)
  readonly timestampISO: string;      // ISO 8601 with timezone
  readonly timezone: string;          // IANA timezone
  readonly category: EventCategory;   // Event category
  readonly payload: unknown;          // Event-specific data
  readonly context: EventContext;     // Attached context
}>;
```

## EventCategory

```typescript
type EventCategory = 'screen' | 'action' | 'network' | 'error' | 'log';
```

## EventContext

```typescript
type EventContext = Readonly<{
  readonly user?: Record<string, unknown>;
  readonly deviceInfo?: Record<string, unknown>;
  readonly [key: string]: unknown;
}>;
```

## Session

```typescript
type Session = Readonly<{
  readonly sessionId: string;
  readonly sessionStart: number;
  readonly startType: 'cold' | 'warm';
  readonly seq: number;
  readonly lastActivityTime: number;
}>;
```

## EventLogConfig

```typescript
type EventLogConfig = Readonly<{
  readonly maxEvents?: number;              // Default: 1000
  readonly maxAgeDays?: number;             // Default: 7
  readonly sessionTimeoutMinutes?: number;  // Default: 30
  readonly batchWriteDelayMs?: number;      // Default: 100
  readonly sanitize?: (event: Event) => Event;
}>;
```

## ExportOptions

```typescript
type ExportOptions = Readonly<{
  readonly mode: 'repro' | 'full';
}>;
```

## Result

```typescript
type Result<T, E = Error> =
  | Readonly<{ readonly ok: true; readonly value: T }>
  | Readonly<{ readonly ok: false; readonly error: E }>;
```

### Usage

```typescript
const result = eventLog.screen('Home');
if (result.ok) {
  // result.value is void
} else {
  console.error(result.error);
}
```

## LogLevel

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
```

## EventQuery

```typescript
type EventQuery = Readonly<{
  readonly category?: ReadonlyArray<EventCategory>;
  readonly timeRange?: Readonly<{ readonly start: number; readonly end: number }>;
  readonly sessionId?: string;
  readonly search?: string;
  readonly limit?: number;
}>;
```

## NetworkEventPayload

```typescript
type NetworkEventPayload = Readonly<{
  readonly url: string;
  readonly method: string;
  readonly status?: number;
  readonly duration?: number;
  readonly error?: string;
  readonly requestHeaders?: Record<string, string>;
  readonly responseHeaders?: Record<string, string>;
  readonly requestBody?: unknown;
  readonly responseBody?: unknown;
}>;
```

## ErrorEventPayload

```typescript
type ErrorEventPayload = Readonly<{
  readonly message: string;
  readonly stack?: string;
  readonly isFatal?: boolean;
  readonly context?: unknown;
}>;
```

## StorageAdapter

```typescript
type StorageAdapter = Readonly<{
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}>;
```

## EventLog

```typescript
type EventLog = Readonly<{
  readonly init: (config?: Partial<EventLogConfig>) => Promise<Result<void>>;
  readonly isReady: () => boolean;
  readonly screen: (name: string, params?: unknown) => Result<void>;
  readonly action: (name: string, data?: unknown) => Result<void>;
  readonly log: (level: LogLevel, message: string, data?: unknown) => Result<void>;
  readonly error: (error: unknown, context?: unknown) => Result<void>;
  readonly setUser: (user: Record<string, unknown>) => void;
  readonly setContext: (key: string, value: unknown) => void;
  readonly setDeviceInfo: (info: Record<string, unknown>) => void;
  readonly export: (options: ExportOptions) => Promise<Result<string>>;
  readonly clear: () => Promise<Result<void>>;
  readonly getEvents: () => Result<ReadonlyArray<Event>>;
  readonly query: (query: EventQuery) => Result<ReadonlyArray<Event>>;
}>;
```
