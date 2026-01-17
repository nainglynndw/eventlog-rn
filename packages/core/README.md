# eventlog-rn

> Functional, type-safe event logging SDK for React Native

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/Bundle-11.7KB-success.svg)](https://bundlephobia.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## What is this?

**eventlog-rn** is a local-first activity tracker for React Native that helps you understand user behavior and debug issues by recording screens, actions, and errors. 

It is designed to be **safe**, **fast**, and **privacy-focused**:
- 🏃‍♂️ **Zero performance impact**: Synchronous logging (<1ms) with batched writes.
- 💾 **Unlimited storage**: Uses MMKV to store thousands of events.
- 🌐 **Network Logs**: Auto-captures `fetch` and `XMLHttpRequest`.
- 🚨 **Error Handling**: Captures crashes, promise rejections, and React render errors.
- 🛡️ **Privacy-first**: Data stays on the device. you control when to export.
- 🧩 **Type-safe**: Built with strict TypeScript and result types for robust error handling.

This is **not** a cloud analytics platform. It is a tool for developers to capture local context and user journeys for debugging and support.

<p align="center">
  <img src="https://github.com/nainglynndw/eventlog-rn/raw/main/packages/core/assets/list.png" width="200" alt="Event List" />
  <img src="https://github.com/nainglynndw/eventlog-rn/raw/main/packages/core/assets/filtering.png" width="200" alt="Filtering" />
  <img src="https://github.com/nainglynndw/eventlog-rn/raw/main/packages/core/assets/details.png" width="200" alt="Event Details" />
  <img src="https://github.com/nainglynndw/eventlog-rn/raw/main/packages/core/assets/network.png" width="200" alt="Network Details" />
</p>


## Documentation

📚 **[Read the Full Documentation](https://nainglynndw.github.io/eventlog-rn/)**

## Quick Start

### 1. Install

```bash
npm install eventlog-rn react-native-mmkv
```

### 2. Initialize

```typescript
import { eventLog } from 'eventlog-rn';

// 1. Initialize (call once at app start)
await eventLog.init(); // Network logging enabled by default!

// 2. Log events
eventLog.screen('HomeScreen');
eventLog.action('button_clicked', { buttonId: 'checkout' });

// 3. Export for debugging
const result = await eventLog.export({ mode: 'repro' });
```

### 3. View logs (optional)

```tsx
import { EventLogViewer, EventLogErrorBoundary } from 'eventlog-rn';

// Wrap app for error handling
<EventLogErrorBoundary>
  <App />
  <EventLogViewer />
</EventLogErrorBoundary>
```

## License

MIT
