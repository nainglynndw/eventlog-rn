/**
 * EventLogViewer - Main component
 * 
 * Clean, modular architecture with proper separation of concerns
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import type { EventLogViewerProps } from './types';
import { Header } from './Header';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { EventList } from './EventList';
import { useEvents, useEventFilter, useEventActions } from './hooks';
import { styles } from './styles';
import { eventLog as globalEventLog } from '../index';

export const EventLogViewer: React.FC<EventLogViewerProps> = ({
  maxEvents = 100,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Custom hooks for state management
  const { events, refetch } = useEvents(globalEventLog, maxEvents);
  const { filter, search, setSearch, toggleFilter, filteredEvents } = useEventFilter(events);
  const { handleClear, handleExport } = useEventActions(globalEventLog, refetch);

  const handleEventPress = (eventId: string): void => {
    setExpandedId(expandedId === eventId ? null : eventId);
  };

  return (
    <View style={styles.container}>
      <Header
        eventCount={filteredEvents.length}
        onExport={handleExport}
        onClear={handleClear}
      />
      <SearchBar value={search} onChange={setSearch} />
      <FilterBar selected={filter} onToggle={toggleFilter} />
      <EventList
        events={filteredEvents}
        onEventPress={handleEventPress}
        expandedId={expandedId}
      />
    </View>
  );
};
