# Expo Router

Track screen navigation automatically with Expo Router.

## Setup

Add tracking to your root layout:

```typescript
// app/_layout.tsx
import { usePathname, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { eventLog } from '@eventlog-rn/core';
import { Slot } from 'expo-router';

export default function RootLayout() {
  const pathname = usePathname();
  const segments = useSegments();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      eventLog.screen(pathname, { segments });
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return <Slot />;
}
```

## Features

✅ **Tracks route changes** - Logs when pathname changes  
✅ **Captures segments** - Includes route segments  
✅ **File-based routing** - Works with Expo Router's file structure  
✅ **Prevents duplicates** - Only logs when pathname actually changes

## Logged Events

```typescript
// User navigates to /home
{
  category: "screen",
  payload: { 
    name: "/home",
    params: { segments: ["home"] }
  }
}

// User navigates to /profile/123
{
  category: "screen",
  payload: { 
    name: "/profile/123",
    params: { segments: ["profile", "123"] }
  }
}
```

## Next Steps

- [React Navigation](/integrations/react-navigation) - For React Navigation users
- [API Reference](/api/eventlog) - Full API documentation
