# Error Handling

@@eventlog-rn/core provides two layers of error tracking:
1. **Global Errors**: Automatically catches app crashes (fatal JS errors) and unhandled promise rejections.
2. **React Error Boundary**: A component to catch errors in your React component tree.

## 1. Global Errors (Automatic)

By default, the library automatically listens for uncaught exceptions and logs them with the `error` category.

This features is **enabled by default**, but you can configure it:

```javascript
await eventLog.init({
  features: {
    // Enabled by default. Set false to disable.
    globalErrors: { enabled: true }
  }
});
```

These errors will have `payload.isFatal: true` and `context.origin: 'global_handler'`.

## 2. React Error Boundary (Component)

To catch errors that happen during React rendering (which would otherwise cause a white screen or a crash), you must wrap your app (or individual screens) with `EventLogErrorBoundary`.

This component does NOT require any provider context.

### Usage

```tsx
import { EventLogErrorBoundary } from 'eventlog-rn-core';

export default function App() {
  return (
    // Wrap your entire app
    <EventLogErrorBoundary>
      <AppNavigator />
    </EventLogErrorBoundary>
  );
}
```

### Custom Fallback UI

You can provide a custom UI to show when an error occurs:

```tsx
<EventLogErrorBoundary 
  fallback={<MyCustomErrorScreen />}
  onError={(error, info) => console.log('Extra side effect', error)}
>
  <YourApp />
</EventLogErrorBoundary>
```

### Using Your Own Error Boundary

If you already have an Error Boundary, you don't need to replace it. Just add `eventLog.error` to your existing `componentDidCatch`:

```javascript
import { eventLog } from 'eventlog-rn-core';

class MyExistingBoundary extends React.Component {
  componentDidCatch(error, info) {
    // Add this line to log to EventLog
    eventLog.error(error, { 
      componentStack: info.componentStack 
    });
    
    // ... your existing logic
  }
}
```
