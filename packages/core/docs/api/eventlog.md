# EventLog API

Complete API reference for the EventLog instance.

## init()

Initialize the event log. Must be called before logging events.

```typescript
init(config?: Partial<EventLogConfig>): Promise<Result<void>>
```

### Parameters

- `config` (optional): Configuration object
  - `maxEvents?: number` - Ring buffer size (default: 1000)
  - `maxAgeDays?: number` - Event retention in days (default: 7)
  - `sessionTimeoutMinutes?: number` - Session timeout (default: 30)
  - `features?:`
    - `network?:`
      - `enabled: boolean` - Enable fetch/XHR interception (default: true if `network` object is present)
      - `logRequestBody?: boolean` - Log request bodies (default: false)
      - `logResponseBody?: boolean` - Log response bodies (default: false)
      - `maxBodySize?: number` - Max body size in bytes (default: 1MB)
    - `globalErrors?:`
      - `enabled: boolean` - Capture global errors (default: true)

### Returns

`Promise<Result<void>>` - Success or error

### Example

```typescript
const result = await eventLog.init({
  maxEvents: 2000,
  maxAgeDays: 14,
  sessionTimeoutMinutes: 60,
});

if (!result.ok) {
  console.error('Init failed:', result.error);
}
```

---

## screen()

Log a screen view.

```typescript
screen(name: string, params?: unknown): Result<void>
```

### Parameters

- `name: string` - Screen name
- `params?: unknown` - Optional route parameters

### Returns

`Result<void>` - Success or error

### Example

```typescript
import { eventLog } from 'eventlog-rn';
eventLog.screen('HomeScreen');
eventLog.screen('ProfileScreen', { userId: '123' });
```

---

## action()

Log a user action.

```typescript
action(name: string, data?: unknown): Result<void>
```

### Parameters

- `name: string` - Action name
- `data?: unknown` - Optional action data

### Returns

`Result<void>` - Success or error

### Example

```typescript
eventLog.action('button_clicked', { buttonId: 'checkout' });
eventLog.action('purchase_completed', { amount: 99.99, currency: 'USD' });
```

---

## log()

Log a message.

```typescript
log(level: LogLevel, message: string, data?: unknown): Result<void>
```

### Parameters

- `level: LogLevel` - Log level (`'debug' | 'info' | 'warn' | 'error'`)
- `message: string` - Log message
- `data?: unknown` - Optional additional data

### Returns

`Result<void>` - Success or error

### Example

```typescript
eventLog.log('info', 'User completed tutorial');
eventLog.log('warn', 'API slow response', { duration: 5000 });
```

---

## error()

Log an error.

```typescript
error(error: unknown, context?: unknown): Result<void>
```

### Parameters

- `error: unknown` - Error object or message
- `context?: unknown` - Optional error context

### Returns

`Result<void>` - Success or error

### Example

```typescript
try {
  await riskyOperation();
} catch (error) {
  eventLog.error(error, { screen: 'Checkout', step: 'payment' });
}
```

---

## setUser()

Set user context (attached to all future events).

```typescript
setUser(user: Record<string, unknown>): void
```

### Parameters

- `user: Record<string, unknown>` - User data

### Example

```typescript
eventLog.setUser({
  id: '123',
  email: 'user@example.com',
  role: 'premium',
});
```

---

## setContext()

Set custom context.

```typescript
setContext(key: string, value: unknown): void
```

### Parameters

- `key: string` - Context key
- `value: unknown` - Context value

### Example

```typescript
eventLog.setContext('featureFlags', {
  newCheckout: true,
  darkMode: false,
});
```

---

## setDeviceInfo()

Set device information.

```typescript
setDeviceInfo(info: Record<string, unknown>): void
```

### Parameters

- `info: Record<string, unknown>` - Device info

### Example

```typescript
eventLog.setDeviceInfo({
  platform: 'ios',
  version: '17.0',
  model: 'iPhone 15',
});
```

---

## export()

Export events as JSONL.

```typescript
export(options: ExportOptions): Promise<Result<string>>
```

### Parameters

- `options: ExportOptions`
  - `mode: 'repro' | 'full'`
    - `repro`: Last 2 sessions + last 10 errors
    - `full`: All events within retention period

### Returns

`Promise<Result<string>>` - JSONL string or error

### Example

```typescript
const result = await eventLog.export({ mode: 'repro' });
if (result.ok) {
  console.log(result.value); // JSONL format
}
```

---

## clear()

Clear all events.

```typescript
clear(): Promise<Result<void>>
```

### Returns

`Promise<Result<void>>` - Success or error

### Example

```typescript
await eventLog.clear();
```

---

## isReady()

Check if initialized.

```typescript
isReady(): boolean
```

### Returns

`boolean` - True if initialized

### Example

```typescript
if (eventLog.isReady()) {
  eventLog.screen('Home');
}
```

---

## getEvents()

Get all events from buffer.

```typescript
getEvents(): Result<ReadonlyArray<Event>>
```

### Returns

`Result<ReadonlyArray<Event>>` - Events array or error

### Example

```typescript
const result = eventLog.getEvents();
if (result.ok) {
  console.log(`Total events: ${result.value.length}`);
}
```

---

## query()

Query events with filters.

```typescript
query(query: EventQuery): Result<ReadonlyArray<Event>>
```

### Parameters

- `query: EventQuery`
  - `category?: EventCategory[]` - Filter by categories
  - `timeRange?: { start: number, end: number }` - Filter by time
  - `sessionId?: string` - Filter by session
  - `search?: string` - Search in payloads
  - `limit?: number` - Limit results

### Returns

`Result<ReadonlyArray<Event>>` - Filtered events or error

### Example

```typescript
const result = eventLog.query({
  category: ['error'],
  timeRange: { start: Date.now() - 3600000, end: Date.now() },
  limit: 10,
});
```
