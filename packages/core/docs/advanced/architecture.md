# Architecture

Deep dive into the internal architecture of `@eventlog-rn/core`.

## Overview

This library follows **functional programming principles** with:
- Pure functions for core logic
- Immutable data structures
- Explicit error handling (Result types)
- Type safety at Rust level

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Application                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              createEventLog (Factory)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Closure-based State                      │  │
│  │  - config: EventLogConfig                        │  │
│  │  - session: Session                              │  │
│  │  - buffer: RingBufferState                       │  │
│  │  - context: EventContext                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Public API (returns Result<T>):                        │
│  - init(), screen(), action(), log(), error()           │
│  - setUser(), setContext(), setDeviceInfo()             │
│  - export(), clear(), isReady()                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌─────────┐
   │ events │  │ buffer  │  │ storage │
   │  .ts   │  │  .ts    │  │ (MMKV)  │
   └────────┘  └─────────┘  └─────────┘
   Pure fns    Immutable    Side effects
```

## File Structure

```
src/
├── types.ts              # All type definitions
├── core/
│   ├── events.ts         # Pure event creation functions
│   ├── buffer.ts         # Immutable ring buffer
│   ├── eventlog.ts       # Main API (closure-based)
│   ├── query.ts          # Event filtering
│   └── utils.ts          # Pure utility functions
├── storage/
│   └── mmkv.ts           # MMKV storage adapter
└── viewer/               # React components
    ├── EventLogViewer.tsx
    ├── hooks.ts
    └── ...
```

## Design Principles

### 1. Functional Programming

**Pure Functions:**
```typescript
export const createEvent = (
  session: Session,
  context: EventContext,
  category: EventCategory,
  payload: unknown
): Event => ({
  // Returns new object, no side effects
});
```

**Immutable State:**
```typescript
export type Event = Readonly<{
  readonly eventId: string;
  // All fields readonly
}>;
```

### 2. Closure-based State

State is encapsulated in factory function closure:

```typescript
export const createEventLog = (): EventLog => {
  let state: InternalState | null = null;
  
  return {
    init: async () => { /* mutates state */ },
    screen: (name) => { /* uses state */ },
  };
};
```

### 3. Result Type for Errors

No exceptions in public API:

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

### 4. Separation of Concerns

| File | Responsibility | Side Effects? |
|------|---------------|---------------|
| `types.ts` | Type definitions | No |
| `events.ts` | Event creation, sanitization | No |
| `buffer.ts` | Ring buffer operations | No |
| `utils.ts` | UUID, timestamps | No (except Date.now()) |
| `eventlog.ts` | State management, I/O | Yes (storage, console) |

## Data Flow

### Event Logging Flow

```
User calls eventLog.screen('Home')
  │
  ▼
logEvent('screen', { name: 'Home' })
  │
  ├─► createEvent(session, context, 'screen', payload)
  │     └─► Returns immutable Event object
  │
  ├─► sanitizeEvent(event)
  │     └─► Redacts sensitive keys, checks size
  │
  ├─► pushEvent(buffer, event)
  │     └─► Returns new buffer state
  │
  ├─► incrementSeq(session)
  │     └─► Returns new session with seq++
  │
  ├─► saveEvents(storage, events)  [debounced]
  │     └─► Async write to MMKV (100ms debounce)
  │
  └─► Returns Result<void>
```

## Performance Optimizations

### 1. Synchronous Event Creation
Event creation is <1ms (no blocking)

### 2. Batched Storage Writes
Debounced writes (100ms) reduce I/O

### 3. Ring Buffer
Fixed-size circular buffer:
- No array resizing
- O(1) push
- Predictable memory

### 4. Lazy Serialization
Only serialize when persisting to storage

## Storage

### MMKV Integration

```typescript
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV({ id: 'eventlog-rn-core' });

export const internalStorage: StorageAdapter = {
  setItem: async (key, value) => mmkv.set(key, value),
  getItem: async (key) => mmkv.getString(key) ?? null,
  removeItem: async (key) => mmkv.delete(key),
};
```

**Why MMKV?**
- 30x faster than AsyncStorage
- Unlimited capacity (no 6MB limit)
- Synchronous API (wrapped in async for compatibility)

## Next Steps

- [API Reference](/api/eventlog) - Full API documentation
- [Core Concepts](/guide/core-concepts) - Understand the library

