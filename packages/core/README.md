# @eventlog-rn/core

> Functional, type-safe event logging SDK for React Native

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/Bundle-11.7KB-success.svg)](https://bundlephobia.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## What is this?

**@eventlog-rn/core** is a local-first activity tracker for React Native that helps you understand user behavior and debug issues by recording screens, actions, and errors. 

It is designed to be **safe**, **fast**, and **privacy-focused**:
- 🏃‍♂️ **Zero performance impact**: Synchronous logging (<1ms) with batched writes.
- 💾 **Unlimited storage**: Uses MMKV to store thousands of events without the 6MB Android limit.
- 🛡️ **Privacy-first**: Data stays on the device. You control when to export or share it.
- 🧩 **Type-safe**: Built with strict TypeScript and result types for robust error handling.

This is **not** a cloud analytics platform. It is a tool for developers to capture local context and user journeys for debugging and support.

## Documentation

📚 **[Read the Full Documentation](https://nainglynndw.github.io/eventlog-rn/)**

## Quick Start

```typescript
import { eventLog } from '@eventlog-rn/core';

// 1. Initialize (call once at app start)
await eventLog.init(); // Network logging enabled by default!

// 2. Log events
eventLog.screen('HomeScreen');
eventLog.action('button_clicked', { buttonId: 'checkout' });

// 3. Export for debugging
const result = await eventLog.export({ mode: 'repro' });

// 4. View logs (optional)
import { EventLogViewer } from '@eventlog-rn/core';
<EventLogViewer />
```

## License

MIT
