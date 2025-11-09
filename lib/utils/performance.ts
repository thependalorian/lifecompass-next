// lib/utils/performance.ts
// Performance monitoring and metrics utility

interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  timestamp: number;
  statusCode?: number;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000; // Keep last 1000 metrics

  /**
   * Record a performance metric
   */
  record(metric: Omit<PerformanceMetric, "timestamp">): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    // Clean up old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get performance statistics for an endpoint
   */
  getStats(
    endpoint?: string,
    timeWindowMs: number = 60000,
  ): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    errorRate: number;
    p95Duration: number;
    p99Duration: number;
  } {
    const now = Date.now();
    const windowStart = now - timeWindowMs;

    let filtered = this.metrics.filter((m) => m.timestamp >= windowStart);
    if (endpoint) {
      filtered = filtered.filter((m) => m.endpoint === endpoint);
    }

    if (filtered.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        errorRate: 0,
        p95Duration: 0,
        p99Duration: 0,
      };
    }

    const durations = filtered.map((m) => m.duration).sort((a, b) => a - b);
    const errors = filtered.filter(
      (m) => m.error || (m.statusCode && m.statusCode >= 400),
    );

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = durations[0];
    const maxDuration = durations[durations.length - 1];
    const errorRate = errors.length / filtered.length;

    // Calculate percentiles
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    const p95Duration = durations[p95Index] || 0;
    const p99Duration = durations[p99Index] || 0;

    return {
      count: filtered.length,
      avgDuration: Math.round(avgDuration),
      minDuration,
      maxDuration,
      errorRate: Math.round(errorRate * 100) / 100,
      p95Duration,
      p99Duration,
    };
  }

  /**
   * Get all metrics (for debugging/admin)
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get slow endpoints (above threshold)
   */
  getSlowEndpoints(
    thresholdMs: number = 1000,
    timeWindowMs: number = 60000,
  ): Array<{
    endpoint: string;
    avgDuration: number;
    count: number;
  }> {
    const now = Date.now();
    const windowStart = now - timeWindowMs;
    const recent = this.metrics.filter((m) => m.timestamp >= windowStart);

    const endpointMap = new Map<
      string,
      { durations: number[]; count: number }
    >();

    recent.forEach((m) => {
      if (m.duration >= thresholdMs) {
        const existing = endpointMap.get(m.endpoint) || {
          durations: [],
          count: 0,
        };
        existing.durations.push(m.duration);
        existing.count++;
        endpointMap.set(m.endpoint, existing);
      }
    });

    return Array.from(endpointMap.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        avgDuration: Math.round(
          data.durations.reduce((a, b) => a + b, 0) / data.durations.length,
        ),
        count: data.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance middleware for API routes
 */
export function withPerformanceMonitoring<
  T extends (...args: any[]) => Promise<any>,
>(handler: T, endpoint: string, method: string = "GET"): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    let statusCode: number | undefined;
    let error: string | undefined;

    try {
      const result = await handler(...args);

      // Try to extract status code from NextResponse
      if (result && typeof result === "object" && "status" in result) {
        statusCode = result.status as number;
      }

      return result;
    } catch (err: any) {
      error = err.message || "Unknown error";
      statusCode = err.statusCode || 500;
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      performanceMonitor.record({
        endpoint,
        method,
        duration,
        statusCode,
        error,
      });
    }
  }) as T;
}

/**
 * Log performance stats (useful for debugging)
 */
export function logPerformanceStats(endpoint?: string): void {
  const stats = performanceMonitor.getStats(endpoint);
  console.log(`[Performance] ${endpoint || "All endpoints"}:`, {
    requests: stats.count,
    avgMs: stats.avgDuration,
    p95Ms: stats.p95Duration,
    p99Ms: stats.p99Duration,
    errorRate: `${(stats.errorRate * 100).toFixed(1)}%`,
  });
}
