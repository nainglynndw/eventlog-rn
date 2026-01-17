/**
 * Type definitions for viewer components
 */

import type { Event, EventCategory, EventLog } from '../types';

export type EventLogViewerProps = {
  readonly eventLog?: EventLog;
  readonly maxEvents?: number;
};

export type EventListProps = {
  readonly events: ReadonlyArray<Event>;
  readonly onEventPress: (eventId: string) => void;
  readonly expandedId: string | null;
};

export type EventItemProps = {
  readonly event: Event;
  readonly expanded: boolean;
  readonly onPress: () => void;
};

export type FilterChipProps = {
  readonly category: EventCategory;
  readonly selected: boolean;
  readonly onToggle: () => void;
};

export type HeaderProps = {
  readonly eventCount: number;
  readonly onExport: () => void;
  readonly onClear: () => void;
};

export type SearchBarProps = {
  readonly value: string;
  readonly onChange: (text: string) => void;
};

export type FilterBarProps = {
  readonly selected: ReadonlyArray<EventCategory>;
  readonly onToggle: (category: EventCategory) => void;
};

export const CATEGORY_COLORS: Readonly<Record<EventCategory, string>> = {
  screen: '#3b82f6',
  action: '#10b981',
  network: '#f59e0b',
  error: '#ef4444',
  log: '#6b7280',
} as const;

export const ALL_CATEGORIES: ReadonlyArray<EventCategory> = [
  'screen',
  'action',
  'network',
  'error',
  'log',
] as const;
