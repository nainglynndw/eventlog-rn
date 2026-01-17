/**
 * Custom hooks for EventLogViewer
 */

import { useState, useEffect, useCallback } from 'react';
import type { Event, EventCategory, EventLog } from '../types';

export const useEvents = (eventLog: EventLog, maxEvents: number) => {
  const [events, setEvents] = useState<ReadonlyArray<Event>>([]);

  const fetchEvents = useCallback(() => {
    const result = eventLog.getEvents();
    if (result.ok) {
      setEvents(result.value.slice(-maxEvents));
    }
  }, [eventLog, maxEvents]);

  useEffect(() => {
    // Fetch once on mount
    fetchEvents();
  }, [fetchEvents]);

  return { events, refetch: fetchEvents };
};

export const useEventFilter = (events: ReadonlyArray<Event>) => {
  const [filter, setFilter] = useState<ReadonlyArray<EventCategory>>([]);
  const [search, setSearch] = useState('');

  const toggleFilter = useCallback((category: EventCategory): void => {
    setFilter((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const filteredEvents = events.filter((event) => {
    if (filter.length > 0 && !filter.includes(event.category)) {
      return false;
    }
    if (search) {
      const searchLower = search.toLowerCase();
      const payloadStr = JSON.stringify(event.payload).toLowerCase();
      return payloadStr.includes(searchLower);
    }
    return true;
  });

  return {
    filter,
    search,
    setSearch,
    toggleFilter,
    filteredEvents,
  };
};

export const useEventActions = (eventLog: EventLog, onClear?: () => void) => {
  const handleClear = useCallback(async (): Promise<void> => {
    await eventLog.clear();
    // Refetch after clearing
    if (onClear) {
      onClear();
    }
  }, [eventLog, onClear]);

  const handleExport = useCallback(async (): Promise<void> => {
    const result = await eventLog.export({ mode: 'full' });
    if (result.ok) {
      console.log('=== EXPORTED LOGS ===');
      console.log(result.value);
      console.log('=== END LOGS ===');
    }
  }, [eventLog]);

  return { handleClear, handleExport };
};
