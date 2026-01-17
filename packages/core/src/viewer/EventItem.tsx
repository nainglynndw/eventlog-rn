/**
 * EventItem component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { EventItemProps } from './types';
import { CATEGORY_COLORS } from './types';
import { styles } from './styles';

export const EventItem: React.FC<EventItemProps> = ({ event, expanded, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.eventItem}>
      {/* Event Header */}
      <View style={styles.eventHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: CATEGORY_COLORS[event.category] },
          ]}
        >
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(event.timestamp).toLocaleTimeString()}
        </Text>
      </View>

      {/* Event Summary */}
      <Text style={styles.eventSummary} numberOfLines={expanded ? undefined : 1}>
        {JSON.stringify(event.payload)}
      </Text>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.eventDetails}>
          <Text style={styles.detailsLabel}>Session:</Text>
          <Text style={styles.detailsText}>{event.sessionId}</Text>

          <Text style={styles.detailsLabel}>Sequence:</Text>
          <Text style={styles.detailsText}>{event.seq}</Text>

          <Text style={styles.detailsLabel}>Timezone:</Text>
          <Text style={styles.detailsText}>{event.timezone}</Text>

          {event.context && Object.keys(event.context).length > 0 && (
            <>
              <Text style={styles.detailsLabel}>Context:</Text>
              <Text style={styles.detailsText}>
                {JSON.stringify(event.context, null, 2)}
              </Text>
            </>
          )}

          <Text style={styles.detailsLabel}>Full Event:</Text>
          <Text style={styles.detailsText}>
            {JSON.stringify(event, null, 2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
