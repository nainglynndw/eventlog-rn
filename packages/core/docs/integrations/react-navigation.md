# React Navigation

Track screen navigation automatically with React Navigation.

## Setup

Add tracking to your `NavigationContainer`:

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { eventLog } from '@eventlog-rn/core';
import { useRef } from 'react';

// Helper to get active route
const getActiveRoute = (state) => {
  const route = state.routes[state.index];
  if (route.state) return getActiveRoute(route.state);
  return { name: route.name, params: route.params };
};

export function RootNavigator() {
  const routeNameRef = useRef();
  const navigationRef = useRef();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const route = getActiveRoute(navigationRef.current.getRootState());
        routeNameRef.current = route.name;
        eventLog.screen(route.name, route.params);
      }}
      onStateChange={(state) => {
        const previousRouteName = routeNameRef.current;
        const route = getActiveRoute(state);

        if (previousRouteName !== route.name) {
          eventLog.screen(route.name, route.params);
          routeNameRef.current = route.name;
        }
      }}
    >
      <AppNavigator />
    </NavigationContainer>
  );
}
```

## Features

✅ **Tracks screen changes** - Logs when user navigates  
✅ **Captures params** - Includes route parameters  
✅ **Handles nested navigators** - Works with tab/stack/drawer  
✅ **Prevents duplicates** - Only logs when route actually changes

## Logged Events

```typescript
// User navigates to Home
{
  category: "screen",
  payload: { name: "Home" }
}

// User navigates to Profile with params
{
  category: "screen",
  payload: { 
    name: "Profile",
    params: { userId: "123" }
  }
}
```

## Next Steps

- [Expo Router](/integrations/expo-router) - For Expo Router users
- [API Reference](/api/eventlog) - Full API documentation
