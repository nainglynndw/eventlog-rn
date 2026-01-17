/**
 * Query events by filters
 */

import type { Event, EventQuery } from '../types';

export const queryEvents = (
  events: ReadonlyArray<Event>,
  query: EventQuery
): ReadonlyArray<Event> => {
  let filtered = events;

  // Filter by category
  if (query.category && query.category.length > 0) {
    filtered = filtered.filter((e) => {
      const categories = query.category;
      return categories ? categories.includes(e.category) : true;
    });
  }

  // Filter by time range
  if (query.timeRange) {
    filtered = filtered.filter(
      (e) =>
        e.timestamp >= query.timeRange!.start &&
        e.timestamp <= query.timeRange!.end
    );
  }

  // Filter by session ID
  if (query.sessionId) {
    filtered = filtered.filter((e) => e.sessionId === query.sessionId);
  }

  // Search in payload
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filtered = filtered.filter((e) => {
      const payloadStr = JSON.stringify(e.payload).toLowerCase();
      return payloadStr.includes(searchLower);
    });
  }

  // Limit results
  if (query.limit && query.limit > 0) {
    filtered = filtered.slice(-query.limit);
  }

  return filtered;
};
