/**
 * Functional ring buffer implementation
 */

import type { Event } from '../types';

/**
 * Ring buffer state (immutable)
 */
export type RingBufferState = Readonly<{
  readonly buffer: ReadonlyArray<Event | undefined>;
  readonly writeIndex: number;
  readonly size: number;
  readonly maxSize: number;
}>;

/**
 * Create a new ring buffer
 */
export const createRingBuffer = (maxSize: number): RingBufferState => {
  return {
    buffer: new Array(maxSize).fill(undefined),
    writeIndex: 0,
    size: 0,
    maxSize,
  } as const;
};

/**
 * Add event to buffer (pure function, returns new state)
 */
export const pushEvent = (
  state: RingBufferState,
  event: Event
): RingBufferState => {
  const newBuffer = [...state.buffer];
  newBuffer[state.writeIndex] = event;

  return {
    ...state,
    buffer: newBuffer,
    writeIndex: (state.writeIndex + 1) % state.maxSize,
    size: Math.min(state.size + 1, state.maxSize),
  } as const;
};

/**
 * Get all events in chronological order (pure function)
 */
export const toArray = (state: RingBufferState): ReadonlyArray<Event> => {
  if (state.size < state.maxSize) {
    return state.buffer.slice(0, state.size).filter((e): e is Event => e !== undefined);
  }

  const afterWrite = state.buffer.slice(state.writeIndex);
  const beforeWrite = state.buffer.slice(0, state.writeIndex);
  
  return [...afterWrite, ...beforeWrite].filter((e): e is Event => e !== undefined);
};

/**
 * Clear buffer (pure function, returns new state)
 */
export const clearBuffer = (state: RingBufferState): RingBufferState => {
  return createRingBuffer(state.maxSize);
};
