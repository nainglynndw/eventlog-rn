# EventLogViewer

In-app viewer component for displaying events.

## Usage

```typescript
import { EventLogViewer } from '@eventlog-rn/core/viewer';

function DebugScreen() {
  return <EventLogViewer />;
}
```

## Features

✅ **Search** - Search events by payload content  
✅ **Filter** - Filter by category (screen, action, error, log)  
✅ **Export** - Export all events to console  
✅ **Clear** - Clear all events  
✅ **Auto-refresh** - Fetches events on mount

## Props

The viewer component takes no props. It uses the default `eventLog` singleton instance.

## UI Components

### Header
- Export button (logs to console)
- Clear button (clears all events)

### Search Bar
- Real-time search in event payloads
- Case-insensitive

### Filter Bar
- Category chips (screen, action, error, log, network)
- Toggle filters on/off
- Shows active filter count

### Event List
- Scrollable list of events
- Color-coded by category
- Shows timestamp, category, and payload
- Newest events at bottom

## Customization

The viewer uses a built-in theme. To customize, you can:

1. Fork the viewer component
2. Modify `src/viewer/styles.ts`
3. Adjust colors, spacing, typography

## Example

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EventLogViewer } from '@eventlog-rn/core/viewer';

export function DebugScreen() {
  return (
    <View style={styles.container}>
      <EventLogViewer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
```

## Performance

- **Initial load:** Fetches events once on mount
- **No polling:** Does not auto-refresh (prevents infinite re-renders)
- **Manual refresh:** Refetch after clear button
- **Memory:** Displays last N events (configurable via `maxEvents`)

## Next Steps

- [API Reference](/api/eventlog) - EventLog API
- [Types](/api/types) - TypeScript types
