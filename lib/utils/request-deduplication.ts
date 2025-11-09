// lib/utils/request-deduplication.ts
// Request deduplication utility to prevent duplicate concurrent requests

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private readonly DEFAULT_TTL = 30000; // 30 seconds - max time to keep pending request
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up stale requests every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Deduplicate a request - if the same request is already pending, return the existing promise
   */
  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<T> {
    // Check if there's already a pending request with this key
    const existing = this.pendingRequests.get(key);
    if (existing) {
      const age = Date.now() - existing.timestamp;
      if (age < ttl) {
        // Return existing promise if it's still fresh
        return existing.promise;
      } else {
        // Remove stale request
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    const promise = requestFn()
      .then((result) => {
        // Remove from pending once resolved
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        // Remove from pending on error too
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store the pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Generate a cache key from request parameters
   */
  static generateKey(
    prefix: string,
    ...params: (string | number | null | undefined)[]
  ): string {
    const sanitized = params
      .filter((p) => p != null)
      .map((p) => String(p).replace(/[^a-zA-Z0-9-]/g, ""))
      .join("-");
    return `${prefix}:${sanitized}`;
  }

  /**
   * Clean up stale requests
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.pendingRequests.forEach((request, key) => {
      const age = now - request.timestamp;
      if (age > this.DEFAULT_TTL) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.pendingRequests.delete(key);
    });

    if (keysToDelete.length > 0) {
      console.log(
        `[RequestDeduplication] Cleaned up ${keysToDelete.length} stale requests`,
      );
    }
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * Get statistics about pending requests
   */
  getStats(): {
    pendingCount: number;
    oldestRequestAge: number;
  } {
    if (this.pendingRequests.size === 0) {
      return {
        pendingCount: 0,
        oldestRequestAge: 0,
      };
    }

    const now = Date.now();
    let oldestAge = 0;

    this.pendingRequests.forEach((request) => {
      const age = now - request.timestamp;
      if (age > oldestAge) {
        oldestAge = age;
      }
    });

    return {
      pendingCount: this.pendingRequests.size,
      oldestRequestAge: oldestAge,
    };
  }

  /**
   * Destroy the deduplicator and clean up intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Export singleton instance
export const requestDeduplicator = new RequestDeduplicator();

// Export class for static methods
export { RequestDeduplicator };

/**
 * Higher-order function to wrap API handlers with request deduplication
 */
export function withDeduplication<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  keyGenerator: (...args: Parameters<T>) => string,
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    return requestDeduplicator.deduplicate(key, () => handler(...args));
  }) as T;
}
