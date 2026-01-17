/**
 * EventList component
 */

import React from 'react';
import { FlatList, View, Text } from 'react-native';
import type { EventListProps } from './types';
import { EventItem } from './EventItem';
import { styles } from './styles';
import type { Event } from '../types';

export const EventList: React.FC<EventListProps> = ({ events, onEventPress, expandedId }) => {
  const renderItem = ({ item }: { item: Event }) => (
    <EventItem
      event={item}
      expanded={expandedId === item.eventId}
      onPress={() => onEventPress(item.eventId)}
    />
  );

  const keyExtractor = (item: Event) => item.eventId;

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No events</Text>
    </View>
  );

  return (
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={renderEmpty}
      style={styles.eventList}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
};
