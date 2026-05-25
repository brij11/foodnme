import { NextResponse } from "next/server";

/**
 * Standard API envelope (TECHNICAL-REQUIREMENTS.md §6.1).
 * Success: { ok: true, data? }. Error: { ok: false, error: { code, message, fields? } }.
 */
export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export type ApiResponse<T> = { ok: true; data?: T } | { ok: false; error: ApiError };

export function ok<T>(data?: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ ok: true, ...(data !== undefined ? { data } : {}) }, init);
}

export function err(
  code: string,
  message: string,
  status: number,
  fields?: Record<string, string>,
) {
  return NextResponse.json<ApiResponse<never>>(
    { ok: false, error: { code, message, ...(fields ? { fields } : {}) } },
    { status },
  );
}

/** Maps a ZodError's flattened field errors into the envelope's `fields` shape. */
export function fieldErrors(flattened: Record<string, string[] | undefined>) {
  const fields: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(flattened)) {
    if (msgs && msgs.length > 0 && msgs[0]) fields[key] = msgs[0];
  }
  return fields;
}
