// app/api/admin/performance/route.ts
// API endpoint for fetching performance metrics (admin dashboard)

import { NextRequest, NextResponse } from "next/server";
import { performanceMonitor } from "@/lib/utils/performance";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    const timeWindow = parseInt(searchParams.get("timeWindow") || "60000"); // Default 1 minute

    // Get performance statistics
    const stats = performanceMonitor.getStats(
      endpoint || undefined,
      timeWindow,
    );

    // Get slow endpoints (above 1 second threshold)
    const slowEndpoints = performanceMonitor.getSlowEndpoints(1000, timeWindow);

    // Get all recent metrics (last 100 for detailed view)
    const allMetrics = performanceMonitor.getAllMetrics().slice(-100);

    // Calculate overall health metrics
    const overallStats = performanceMonitor.getStats(undefined, timeWindow);
    const healthScore = calculateHealthScore(overallStats);

    return NextResponse.json({
      timestamp: Date.now(),
      timeWindow: timeWindow,
      health: {
        score: healthScore,
        status: getHealthStatus(healthScore),
        overallStats,
      },
      endpointStats: endpoint ? stats : undefined,
      slowEndpoints: slowEndpoints.slice(0, 10), // Top 10 slowest
      recentMetrics: allMetrics.map((m) => ({
        endpoint: m.endpoint,
        method: m.method,
        duration: m.duration,
        statusCode: m.statusCode,
        error: m.error,
        timestamp: m.timestamp,
      })),
      summary: {
        totalRequests: overallStats.count,
        averageResponseTime: overallStats.avgDuration,
        errorRate: overallStats.errorRate,
        p95ResponseTime: overallStats.p95Duration,
        p99ResponseTime: overallStats.p99Duration,
      },
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch performance metrics",
        message:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Please try again later.",
      },
      { status: 500 },
    );
  }
}

/**
 * Calculate health score (0-100) based on performance metrics
 */
function calculateHealthScore(stats: {
  count: number;
  avgDuration: number;
  errorRate: number;
  p95Duration: number;
}): number {
  if (stats.count === 0) {
    return 100; // No requests = perfect health
  }

  let score = 100;

  // Penalize for high error rate (max -50 points)
  score -= Math.min(stats.errorRate * 50, 50);

  // Penalize for slow average response time (max -30 points)
  // Ideal: < 200ms, Good: < 500ms, Acceptable: < 1000ms, Poor: > 1000ms
  if (stats.avgDuration > 1000) {
    score -= 30;
  } else if (stats.avgDuration > 500) {
    score -= 15;
  } else if (stats.avgDuration > 200) {
    score -= 5;
  }

  // Penalize for high p95 response time (max -20 points)
  if (stats.p95Duration > 2000) {
    score -= 20;
  } else if (stats.p95Duration > 1000) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get health status based on score
 */
function getHealthStatus(
  score: number,
): "excellent" | "good" | "fair" | "poor" | "critical" {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  if (score >= 40) return "poor";
  return "critical";
}
