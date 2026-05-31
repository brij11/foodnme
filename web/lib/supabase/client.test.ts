import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture the options passed through to @supabase/ssr so we can assert the cookie
// lifetime the "Keep me signed in" control drives (story-auth-09 AC#2, #3).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createBrowserClient = vi.fn((_url?: unknown, _key?: unknown, _options?: unknown) => ({
  tag: "supabase-client",
}));
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: (url: unknown, key: unknown, options?: unknown) =>
    createBrowserClient(url, key, options),
}));

import {
  createClient,
  KEEP_SIGNED_IN_MAX_AGE_SECONDS,
} from "./client";

describe("createClient session persistence (story-auth-09)", () => {
  beforeEach(() => {
    createBrowserClient.mockClear();
  });

  it("exports a 30-day max-age constant", () => {
    expect(KEEP_SIGNED_IN_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 30);
  });

  it("passes a 30-day cookie maxAge when persistent (AC#2)", () => {
    createClient({ persistent: true });
    const opts = createBrowserClient.mock.calls[0]?.[2] as
      | { cookieOptions?: { maxAge?: number } }
      | undefined;
    expect(opts?.cookieOptions?.maxAge).toBe(KEEP_SIGNED_IN_MAX_AGE_SECONDS);
  });

  it("sets no cookie maxAge (browser-session cookie) when not persistent (AC#3)", () => {
    createClient({ persistent: false });
    const opts = createBrowserClient.mock.calls[0]?.[2];
    expect(opts).toBeUndefined();
  });

  it("defaults to a standard session when no options are given", () => {
    createClient();
    const opts = createBrowserClient.mock.calls[0]?.[2];
    expect(opts).toBeUndefined();
  });
});
