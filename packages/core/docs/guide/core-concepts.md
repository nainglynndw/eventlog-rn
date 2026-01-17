# Core Concepts

## What is `eventlog-rn` is built around a few simple concepts:ivity tracker** for React Native that helps users share their app usage with customer support.

### Primary Purpose: Customer Support

**The Problem:**
- Users report bugs with vague descriptions: "It's broken" or "It doesn't work"
- Support teams struggle to reproduce issues
- Back-and-forth emails waste time

**The Solution:**
- Track user activities automatically (screens, actions, errors)
- Store everything locally on the user's device
- Let users export and share logs when they contact support

### What it IS ✅

- **Customer support tool** - Help users explain issues to support
- **Privacy-focused** - Data stays on device until user shares it
- **Performance-first** - <1ms logging, no impact on app
- **User-controlled** - Users decide when and what to share

### What it's NOT ❌

- **NOT an analytics platform** - Not for tracking business metrics
- **NOT automatic reporting** - Users must consent to share
- **NOT a remote logging service** - No data sent without user action

## Use Cases

### Primary: Customer Support
1. **Better Bug Reports** - Users attach activity logs to support tickets
2. **Faster Resolution** - Support sees exactly what user did
3. **User Empowerment** - Users can share context with one tap

### Secondary
1. **UX Research** - Understand user navigation patterns
2. **Feature Usage** - See which features are actually used
3. **Performance Debugging** - Track slow operations

## Key Concepts

### Events

Every action in your app is an event:

```typescript
{
  eventId: "uuid",
  sessionId: "uuid",
  seq: 0,
  timestamp: 1705340799000,
  category: "screen",
  payload: { name: "Home" },
  context: { user: {...}, deviceInfo: {...} }
}
```

**Categories:**
- `screen` - Screen views
- `action` - User actions (button clicks, etc.)
- `error` - Errors and exceptions
- `log` - General log messages
- `network` - API calls (coming soon)

### Sessions

A session groups related events:

- **Cold start** - App launched from scratch
- **Warm start** - App resumed after timeout
- **Timeout** - 30 minutes of inactivity (configurable)

### Context

Data attached to all events:

```typescript
{
  user: { id: "123", email: "user@example.com" },
  deviceInfo: { platform: "ios", version: "17.0" },
  customKey: "customValue"
}
```

### Ring Buffer

Events are stored in a fixed-size circular buffer:

- **Fixed memory** - No unbounded growth
- **Auto-eviction** - Old events removed automatically
- **Configurable size** - Default 1000 events (~500KB)

### Privacy

Automatic redaction of sensitive data:

```typescript
// Before
{ password: "secret123" }

// After
{ password: "***REDACTED***" }
```

**Redacted keys:** `password`, `token`, `apiKey`, `authorization`, `secret`, etc.

## Architecture

```
User App
    ↓
eventLog.init()
    ↓
createEventLog (Factory)
    ↓
Closure-based State
    ├── session
    ├── buffer (ring buffer)
    └── context
    ↓
MMKV Storage (local)
```

## Performance

- **Event logging:** <1ms (synchronous)
- **Storage writes:** Batched (100ms debounce)
- **Memory:** <5MB for 2000 events
- **Bundle size:** 13.8KB (core) + 25KB (viewer)

## Next Steps

- [API Reference](/api/eventlog) - Full API documentation
- [Navigation Tracking](/integrations/react-navigation) - Auto-track screens
- [Architecture](/advanced/architecture) - Deep dive into internals
