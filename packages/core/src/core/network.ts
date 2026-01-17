/**
 * Network interception logic (Fetch & XHR)
 */

import type { EventLog, FeatureConfig, NetworkEventPayload } from '../types';

type NetworkConfig = NonNullable<FeatureConfig['network']>;

// Keep original globals
const originalFetch = global.fetch;
const originalXMLHttpRequest = global.XMLHttpRequest;

/**
 * Intercept Fetch API
 */
const interceptFetch = (eventLog: EventLog, config: NetworkConfig) => {
  if (!config.interceptFetch) return;

  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const startTime = Date.now();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method ?? 'GET').toUpperCase();

    try {
      const response = await originalFetch(input, init);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Clone response to read body without consuming original stream
      const clone = response.clone();
      
      let responseBody: unknown;
      if (config.logResponseBody) {
         try {
            // Text first to check size/parse JSON
            const text = await clone.text();
            if (!config.maxBodySize || text.length <= config.maxBodySize) {
                try {
                    responseBody = JSON.parse(text);
                } catch {
                    responseBody = text;
                }
            } else {
                responseBody = `[Body too large: ${text.length} bytes]`;
            }
         } catch {
            responseBody = '[Failed to read response body]';
         }
      }

      const payload: NetworkEventPayload = {
        url,
        method,
        status: response.status,
        duration,
        responseHeaders: config.redactHeaders ? redactHeaders(response.headers, config.redactHeaders) : headersToObject(response.headers),
        responseBody,
      };

      eventLog.network(payload);
      
      return response;
    } catch (error) {
      const endTime = Date.now();
      eventLog.error(error, {
        url,
        method,
        duration: endTime - startTime,
        category: 'network', // Context hack
      });
      throw error;
    }
  };
};

/**
 * Intercept XMLHttpRequest
 */
const interceptXHR = (eventLog: EventLog, config: NetworkConfig) => {
  // If explicitly disabled, return. Undefined means enabled by default.
  if (config.interceptAxios === false) return;

  const XHR = originalXMLHttpRequest;
  
  // @ts-ignore - Monkey patching
  global.XMLHttpRequest = function() {
    const xhr = new XHR();
    const startTime = Date.now();
    let method = 'GET';
    let url = '';

    const originalOpen = xhr.open;
    const originalSend = xhr.send;

    xhr.open = function(m: string, u: string, ...args: any[]) {
      method = m.toUpperCase();
      url = u;
      return originalOpen.apply(this, [m, u, ...args] as any);
    };

    xhr.send = function(body?: any) {
        xhr.addEventListener('loadend', () => {
            const duration = Date.now() - startTime;
             
             // Extract headers (messy in XHR)
             const responseHeadersString = xhr.getAllResponseHeaders();
             const responseHeaders = parseXHRHeaders(responseHeadersString);

             let responseBody: unknown;
             if (config.logResponseBody) {
                 try {
                     if (xhr.responseType === '' || xhr.responseType === 'text') {
                         responseBody = xhr.responseText;
                         if (responseBody && typeof responseBody === 'string' && (!config.maxBodySize || responseBody.length <= config.maxBodySize)) {
                             try { responseBody = JSON.parse(responseBody); } catch {}
                         }
                     }
                 } catch {}
             }

            const payload: NetworkEventPayload = {
              url,
              method,
              status: xhr.status,
              duration,
              responseHeaders: config.redactHeaders ? redactHeaders(responseHeaders, config.redactHeaders) : responseHeaders as any,
              responseBody,
            };
            
            // @ts-ignore - We will add this method
            if (typeof eventLog.network === 'function') {
                // @ts-ignore
                eventLog.network(payload);
            }
        });
        return originalSend.apply(this, [body]);
    }

    return xhr;
  };
  
  // Restore prototype chain
  global.XMLHttpRequest.prototype = XHR.prototype;
  Object.assign(global.XMLHttpRequest, XHR);
};

/**
 * Helpers
 */
const headersToObject = (headers: Headers): Record<string, string> => {
    const obj: Record<string, string> = {};
    headers.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

const redactHeaders = (headers: Headers | Record<string, string>, keysToRedact: ReadonlyArray<string>): Record<string, string> => {
    const obj = headers instanceof Headers ? headersToObject(headers) : headers;
    const redacted: Record<string, string> = { ...obj };
    keysToRedact.forEach(key => {
        const lowerKey = key.toLowerCase();
        // Simple case-insensitive match simulation
        Object.keys(redacted).forEach(h => {
            if (h.toLowerCase() === lowerKey) {
                redacted[h] = '***REDACTED***';
            }
        });
    });
    return redacted;
}

const parseXHRHeaders = (headers: string): Record<string, string> => {
    if (!headers) return {};
    const result: Record<string, string> = {};
    const pairs = headers.trim().split(/[\r\n]+/);
    pairs.forEach(line => {
        const parts = line.split(': ');
        if (parts.length >= 2) {
            const key = parts.shift()!;
            const value = parts.join(': ');
            result[key] = value;
        }
    });
    return result;
}

/**
 * Main enable function
 */
export const enableNetworkInterception = (eventLog: EventLog, config: FeatureConfig['network']) => {
    if (!config || !config.enabled) return;
    
    // Cleanup first just in case
    restoreNetworkInterception();

    if (config.interceptFetch !== false) {
        interceptFetch(eventLog, config);
    }
    // Default to true for XHR if not specified, or checks interceptAxios
    if (config.interceptAxios !== false) {
        interceptXHR(eventLog, config);
    }
};

export const restoreNetworkInterception = () => {
    global.fetch = originalFetch;
    global.XMLHttpRequest = originalXMLHttpRequest;
};
