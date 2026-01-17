/**
 * Pure utility functions
 */

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get current timestamp in milliseconds
 */
export const getTimestamp = (): number => Date.now();

/**
 * Get ISO 8601 timestamp with timezone
 */
export const getTimestampISO = (): string => new Date().toISOString();

/**
 * Get IANA timezone identifier
 */
export const getTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

/**
 * Debounce function (returns a new function, pure in concept)
 */
export const debounce = <T extends ReadonlyArray<unknown>>(
  func: (...args: T) => void,
  wait: number
): ((...args: T) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: T): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};
