import "server-only";
import { Redis } from "@upstash/redis";

/**
 * Idempotency-Key dedupe over Upstash Redis (TECHNICAL-REQUIREMENTS.md §6.1, 5-minute window).
 *
 * Degrades gracefully: if Upstash env vars are absent (local dev) the helpers no-op so the
 * endpoint still works — dedupe is best-effort, never a hard dependency.
 */
const WINDOW_SECONDS = 5 * 60;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Returns a previously-stored response for this key, or null if first-seen / unavailable. */
export async function getCachedResponse<T>(key: string | null | undefined): Promise<T | null> {
  if (!key) return null;
  const redis = getRedis();
  if (!redis) return null;
  try {
    return (await redis.get<T>(`idem:${key}`)) ?? null;
  } catch {
    return null;
  }
}

/** Stores the response under the key for the dedupe window. */
export async function cacheResponse<T>(key: string | null | undefined, value: T): Promise<void> {
  if (!key) return;
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(`idem:${key}`, value, { ex: WINDOW_SECONDS });
  } catch {
    // best-effort
  }
}
