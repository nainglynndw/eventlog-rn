# Getting Started

## Installation

Install the package and its peer dependencies:

```bash
npm install @eventlog-rn/core react-native-mmkv
```

### For MMKV v4 (React Native 0.75+)

If you're using React Native 0.75 or higher with MMKV v4, also install:

```bash
npm install react-native-nitro-modules
```

### iOS Setup

```bash
cd ios && pod install
```

### Android Setup

No additional setup required.

## Requirements

- React Native >= 0.74.0
- react-native-mmkv >= 3.0.0

**Compatibility:** Supports both MMKV v3 and v4. The library automatically detects which version you have installed.

## Initialize

Call `init()` once at app startup:

```typescript
import { eventLog } from '@eventlog-rn/core';

// In your index.js or App.tsx
await eventLog.init({
  features: {
    // Network logging is enabled by default!
    // But you can configure it:
    network: {
      logResponseBody: false, // Set true to capture response bodies
    },
  },
});
```

### With Custom Configuration

```typescript
await eventLog.init({
  maxEvents: 2000,              // Ring buffer size (default: 1000)
  maxAgeDays: 14,               // Event retention (default: 7)
  sessionTimeoutMinutes: 60,    // Session timeout (default: 30)
});
```

## Basic Usage

```typescript
// Log screen views
eventLog.screen('HomeScreen');

// Log user actions
eventLog.action('button_clicked', { buttonId: 'checkout' });

// Log messages
eventLog.log('info', 'User completed onboarding');

// Log errors
try {
  await riskyOperation();
} catch (error) {
  eventLog.error(error, { context: 'checkout' });
}
```

## Add Viewer (Optional)

Display events in your app. Can be imported directly from the core package:

```typescript
import { EventLogViewer } from '@eventlog-rn/core';

// In your debug screen
<EventLogViewer />
```

## Next Steps

- [Quick Start Guide](/guide/quickstart) - Complete walkthrough
- [Core Concepts](/guide/core-concepts) - Understand the library
- [API Reference](/api/eventlog) - Full API documentation
