# Quick Start

This guide will get you up and running in 5 minutes.

## Step 1: Install

```bash
npm install @eventlog-rn/core react-native-mmkv

# If using React Native 0.75+ with MMKV v4:
npm install react-native-nitro-modules

# iOS only
cd ios && pod install
```

## Step 3: Initialize

```typescript
// index.js or App.tsx
import { eventLog } from 'eventlog-rn-core';

await eventLog.init({
    features: {
        network: { enabled: true }
    }
});
```

## Step 4: Add Viewer (Optional)

```typescript
// 4. Use the implicit Viewer (no prop needed!)
// It automatically uses the singleton instance from the package.
import { EventLogViewer } from '@eventlog-rn/core';
import { SafeAreaView } from 'react-native'; // Assuming SafeAreaView is available

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* ... your app ... */}
      
      {/* Viewer automatically connects to the global eventLog */}
      <EventLogViewer />
    </SafeAreaView>
  );
}
```

## Step 5: Export Logs

```typescript
const result = await eventLog.export({ mode: 'repro' });
if (result.ok) {
  console.log(result.value); // JSONL format
}
```

## Complete Example

```typescript
import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import { eventLog } from 'eventlog-rn-core';
import { EventLogViewer } from '@eventlog-rn/core/viewer';

// Initialize on app start
useEffect(() => {
  eventLog.init();
}, []);

function HomeScreen() {
  useEffect(() => {
    eventLog.screen('Home');
  }, []);

  return (
    <View>
      <Button
        title="Click Me"
        onPress={() => {
          eventLog.action('button_clicked', { screen: 'Home' });
        }}
      />
    </View>
  );
}

function DebugScreen() {
  return <EventLogViewer />;
}
```

## Next Steps

- [Core Concepts](/guide/core-concepts) - Understand sessions, events, and context
- [Navigation Tracking](/integrations/react-navigation) - Auto-track screen changes
- [API Reference](/api/eventlog) - Full API documentation
