/**
 * Global Error Handlers (Fatal & Promise Rejections)
 */

import type { EventLog, FeatureConfig } from '../types';

type GlobalErrorsConfig = NonNullable<FeatureConfig['globalErrors']>;

// React Native's global error handler interface
interface ErrorUtils {
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
  getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
}

declare let ErrorUtils: ErrorUtils;

/**
 * Enable global error tracking
 */
export const enableGlobalErrorLogging = (
  eventLog: EventLog,
  config: GlobalErrorsConfig
) => {
  if (!config || config.enabled === false) return;

  // 1. Handle JS Fatal Errors (Reference: React Native ErrorUtils)
  try {
    // @ts-ignore - ErrorUtils is a React Native global
    if (global.ErrorUtils) {
      // @ts-ignore
      const originalHandler = global.ErrorUtils.getGlobalHandler();

      // @ts-ignore
      global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        // Log to EventLog
        eventLog.error(error, {
          isFatal,
          origin: 'global_handler',
          timestamp: Date.now(),
        });

        // Delegate to original handler (Crash or LogBox)
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }
  } catch (e) {
    // Failsafe: Don't crash if ErrorUtils is strangely absent or behavior changes
    console.warn('[EventLog] Failed to setup ErrorUtils handler', e);
  }

  // 2. Handle Unhandled Promise Rejections
  // React Native environments typically handle this via 'tracking' packages or polyfills.
  // Modern RN versions might support 'unhandledrejection' event on global.
  // We opt for a safe, non-intrusive approach:
  // If the user wants promise rejection tracking, they usually need a specific RN version support.
  // We will add a simple listener if available.
  
  const rejectionHandler = (event: any) => {
      // Logic for web or standard JS environments
      // RN generic "promise rejection" handling is complex and varies by version.
      // We'll stick to ErrorUtils primarily for now as it's the RN standard for crashes.
      const reason = event?.reason;
      if (reason) {
          eventLog.error(reason, {
              origin: 'unhandled_rejection',
              isFatal: false
          });
      }
  };

  // Safe attach (mostly for web/hybrid - purely native RN relies on ErrorUtils for fatals)
  // @ts-ignore
  if (typeof window !== 'undefined' && window.addEventListener) {
      // @ts-ignore
      window.addEventListener('unhandledrejection', rejectionHandler);
  }
};
