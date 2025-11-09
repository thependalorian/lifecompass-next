// lib/rateLimit.ts
// Simple in-memory rate limiting for Vercel Edge Runtime

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (resets on serverless function restart)
// For production, consider using Redis or Vercel KV
const rateLimitStore: RateLimitStore = {};

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

export function rateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const key = identifier;

  // Get or create rate limit entry
  let entry = rateLimitStore[key];

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore[key] = entry;
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  const allowed = entry.count <= RATE_LIMIT_MAX_REQUESTS;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
  const resetAt = entry.resetTime;

  // Clean up old entries (simple cleanup - remove entries older than 5 minutes)
  if (Object.keys(rateLimitStore).length > 1000) {
    const cutoff = now - 5 * 60 * 1000;
    Object.keys(rateLimitStore).forEach((k) => {
      if (rateLimitStore[k].resetTime < cutoff) {
        delete rateLimitStore[k];
      }
    });
  }

  return {
    allowed,
    remaining,
    resetAt,
  };
}

// Get client identifier from request
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  // Use first IP from forwarded header, or fallback to other headers
  const ip =
    forwarded?.split(",")[0]?.trim() || realIp || cfConnectingIp || "unknown";

  return `rate_limit:${ip}`;
}
