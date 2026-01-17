/**
 * Pure event creation functions
 */

import type {
  Event,
  EventCategory,
  EventContext,
  Session,
  LogLevel,
  ErrorEventPayload,
} from '../types';
import { generateUUID, getTimestamp, getTimestampISO, getTimezone } from './utils';

/**
 * Create an event (pure function)
 */
export const createEvent = (
  session: Session,
  context: EventContext,
  category: EventCategory,
  payload: unknown
): Event => {
  return {
    eventId: generateUUID(),
    sessionId: session.sessionId,
    seq: session.seq,
    timestamp: getTimestamp(),
    timestampISO: getTimestampISO(),
    timezone: getTimezone(),
    category,
    payload,
    context,
  } as const;
};

/**
 * Create a screen event payload
 */
export const createScreenPayload = (
  name: string,
  params?: unknown
): Readonly<{ name: string; params?: unknown }> => {
  return { name, params } as const;
};

/**
 * Create an action event payload
 */
export const createActionPayload = (
  name: string,
  data?: unknown
): Readonly<{ name: string; data?: unknown }> => {
  return { name, data } as const;
};

/**
 * Create a log event payload
 */
export const createLogPayload = (
  level: LogLevel,
  message: string,
  data?: unknown
): Readonly<{ level: LogLevel; message: string; data?: unknown }> => {
  return { level, message, data } as const;
};

/**
 * Create an error event payload
 */
export const createErrorPayload = (
  error: unknown,
  context?: unknown
): ErrorEventPayload => {
  const err = error as { message?: string; stack?: string };
  const payload: ErrorEventPayload = {
    message: err.message ?? String(error),
    ...(err.stack !== undefined && { stack: err.stack }),
    ...(context !== undefined && { context }),
  };
  return payload;
};

/**
 * Increment session sequence number (pure function, returns new session)
 */
export const incrementSeq = (session: Session): Session => {
  return {
    ...session,
    seq: session.seq + 1,
  } as const;
};

/**
 * Update session activity time (pure function, returns new session)
 */
export const updateSessionActivity = (session: Session): Session => {
  return {
    ...session,
    lastActivityTime: getTimestamp(),
  } as const;
};

/**
 * Check if session has expired
 */
export const isSessionExpired = (
  session: Session,
  timeoutMs: number
): boolean => {
  const now = getTimestamp();
  return now - session.lastActivityTime > timeoutMs;
};

/**
 * Create a new session
 */
export const createSession = (
  startType: 'cold' | 'warm'
): Session => {
  const now = getTimestamp();
  return {
    sessionId: generateUUID(),
    sessionStart: now,
    startType,
    seq: 0,
    lastActivityTime: now,
  } as const;
};

/**
 * Sanitize event (pure function)
 */
const SENSITIVE_KEYS = [
  'password',
  'token',
  'authorization',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
] as const;

const MAX_DEPTH = 10;
const MAX_SIZE = 100 * 1024; // 100KB

const isSensitiveKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));
};

const sanitizeValue = (value: unknown, depth: number): unknown => {
  if (depth > MAX_DEPTH) {
    return { _maxDepthExceeded: true } as const;
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      const val = (value as Record<string, unknown>)[key];
      sanitized[key] = isSensitiveKey(key)
        ? '***REDACTED***'
        : sanitizeValue(val, depth + 1);
    }
  }

  return sanitized;
};

export const sanitizeEvent = (event: Event): Event => {
  const sanitizedPayload = sanitizeValue(event.payload, 0);
  const sanitizedContext = sanitizeValue(event.context, 0) as EventContext;

  // Check size
  const size = JSON.stringify(event).length;
  if (size > MAX_SIZE) {
    return {
      ...event,
      payload: { _truncated: true, _originalSize: size },
      context: event.context,
    };
  }

  return {
    ...event,
    payload: sanitizedPayload,
    context: sanitizedContext,
  };
};

/**
 * Export events as JSONL (pure function)
 */
export const exportEventsAsJSONL = (
  events: ReadonlyArray<Event>,
  mode: 'repro' | 'full'
): string => {
  const filtered = mode === 'repro' ? getReproEvents(events) : events;
  return filtered.map((event) => JSON.stringify(event)).join('\n');
};

/**
 * Get events for repro mode (pure function)
 */
const getReproEvents = (events: ReadonlyArray<Event>): ReadonlyArray<Event> => {
  if (events.length === 0) {
    return [];
  }

  const lastEvent = events[events.length - 1];
  if (lastEvent === undefined) {
    return [];
  }

  const currentSessionId: string = lastEvent.sessionId;

  // Get all unique session IDs
  const sessionIds = Array.from(new Set(events.map((e) => e.sessionId)));
  const currentSessionIndex = sessionIds.indexOf(currentSessionId);
  const previousSessionId: string | null =
    currentSessionIndex > 0 ? sessionIds[currentSessionIndex - 1] ?? null : null;

  // Get errors
  const errors = events.filter((e) => e.category === 'error').slice(-10);

  // Get events from current and previous session
  const sessionEvents = events.filter(
    (e) => e.sessionId === currentSessionId || e.sessionId === previousSessionId
  );

  // Combine and deduplicate
  const combined = [...sessionEvents];
  errors.forEach((error) => {
    if (!combined.find((e) => e.eventId === error.eventId)) {
      combined.push(error);
    }
  });

  // Sort by timestamp
  return combined.sort((a, b) => a.timestamp - b.timestamp);
};
