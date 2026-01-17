# eventlog-rn

> Functional, type-safe event logging SDK for React Native

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/Bundle-11.7KB-success.svg)](https://bundlephobia.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## What is this?

# eventlog-rn

Functional, type-safe event logging SDK for React Native.

Optimized for **reliability**, **performance**, and **ease of use**.

## Features

- **Type-Safe**: Full TypeScript support with generics.
- **Batched Uploads**: Efficiently queues events to minimize network requests.
- **Offline Support**: Caches events when offline and syncs when back online.
- **Session Tracking**: Automatic session management.
- **Built-in UI**: Inspect logs on-device with the included Viewer component.

## Quick Start

### 1. Install

```bash
npm install eventlog-rn react-native-mmkv
```

### 2. Initialize

```typescript
import { eventLog } from 'eventlog-rn';

// Initialize at app launch based on your config
eventLog.init({
  // ...
});
```
Network logging enabled by default!

// 2. Log events
eventLog.screen('HomeScreen');
eventLog.action('button_clicked', { buttonId: 'checkout' });

// 3. Export for debugging
const result = await eventLog.export({ mode: 'repro' });

// 4. View logs (optional)
import { EventLogViewer, EventLogErrorBoundary } from 'eventlog-rn';

// Wrap app for error handling
<EventLogErrorBoundary>
  <App />
  <EventLogViewer />
</EventLogErrorBoundary>
```

## License

MIT
