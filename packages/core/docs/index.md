---
layout: home

hero:
  name:# eventlog-rn-core"
  tagline: Track user activities locally. Share with support when needed.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/nainglynndw/eventlog-rn

features:
  - icon: 🤝
    title: Better Customer Support
    details: Users can share activity logs with support to resolve issues faster
  - icon: 🔒
    title: Privacy-First
    details: All data stays on device. Users control when and what they share with support
  - icon: 📝
    title: Automatic Tracking
    details: Captures screens, actions, and errors automatically - no manual logging needed
  - icon: 📦
    title: Unlimited Storage
    details: MMKV-powered storage with no 6MB limit, stores thousands of events locally
  - icon: ⚡
    title: Performance-First
    details: <1ms event logging, 13.8KB bundle size, no impact on app performance
  - icon: 🛡️
    title: Type-Safe
    details: Rust-level TypeScript strictness, Result types for error handling
---

## Quick Example

```typescript
import { eventLog } from 'eventlog-rn-core';

// Initialize once
await eventLog.init();

// Log events
eventLog.screen('HomeScreen');
eventLog.action('button_clicked', { buttonId: 'checkout' });

// Export for debugging
const result = await eventLog.export({ mode: 'repro' });
```

## What is it?

A **local-first activity tracker** for React Native that helps users share their app usage with customer support.

**How it works:**
1. 📝 **Track activities** - Automatically logs user actions, screens, and errors locally
2. 💾 **Store on-device** - All data stays private on the user's device
3. 🤝 **Share with consent** - Users can export and send logs to support when they need help

**Perfect for customer support:**
- 🐛 **Faster bug resolution** - See exactly what the user did before the issue
- 📊 **Better support tickets** - Users attach activity logs instead of vague descriptions
- 🔒 **Privacy-first** - Users control when and what they share
- ⚡ **No server needed** - Everything happens locally

**Not an analytics platform.** This is a support tool that respects user privacy.
- [Error Handling](guide/error-handling.md)
