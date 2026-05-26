import type { NextRequest } from "next/server";
import { downloadSchema } from "@/lib/schemas/download";
import { createServiceClient } from "@/lib/supabase/service";
import { ok, err, fieldErrors, type ApiResponse } from "@/lib/api";
import { getCachedResponse, cacheResponse } from "@/lib/idempotency";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

const SIGNED_URL_TTL_SECONDS = 60;
const TEMPLATES_BUCKET = "templates";

type DownloadData = { download_url: string };

/**
 * POST /api/download (TECHNICAL-REQUIREMENTS.md §6.2). No auth, no Turnstile (§9.6 — a download
 * is not a spam-targeted write surface).
 *
 * Zod-validate → (best-effort idempotency replay) → atomically increment the counter
 * (`increment_template_download` RPC: UPDATE … SET download_count = download_count + 1 RETURNING)
 * → 404 if the id doesn't exist → optionally upsert the email into newsletter_subscribers
 * (source 'template_detail', reactivate on conflict) → 60s-TTL Supabase Storage signed URL →
 * { ok: true, data: { download_url } }.
 */
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = downloadSchema.safeParse(json);
  if (!parsed.success) {
    return err("invalid_body", "Invalid request.", 400, fieldErrors(parsed.error.flatten().fieldErrors));
  }
  const { template_id, email } = parsed.data;

  // Best-effort 5s/5min idempotency: replay a cached success for the same Idempotency-Key
  // (no-ops entirely when Upstash isn't configured).
  const idemKey = request.headers.get("idempotency-key");
  const cached = await getCachedResponse<ApiResponse<DownloadData>>(idemKey);
  if (cached) return ok(cached.ok ? cached.data : undefined);

  const supabase = createServiceClient();

  // Atomic increment; an empty result set means the template id was not found.
  const { data: rows, error: rpcError } = await supabase.rpc("increment_template_download", {
    p_template_id: template_id,
  });
  if (rpcError) {
    logError("download.increment_failed", { message: rpcError.message });
    return err("db_error", "Could not process the download. Please try again.", 500);
  }
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) {
    return err("not_found", "Template not found.", 404);
  }
  const fileUrl = (row as { file_url: string | null }).file_url;
  if (!fileUrl) {
    return err("file_unavailable", "This template has no downloadable file yet.", 404);
  }

  // Optional email capture — never gates the download.
  if (email) {
    const { error: upsertError } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, source: "template_detail", is_active: true, subscribed_at: new Date().toISOString() },
        { onConflict: "email" },
      );
    if (upsertError) {
      // The download is the primary action — a capture failure must not block it.
      logError("download.email_upsert_failed", { message: upsertError.message });
    }
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(TEMPLATES_BUCKET)
    .createSignedUrl(fileUrl, SIGNED_URL_TTL_SECONDS);
  if (signError || !signed?.signedUrl) {
    logError("download.sign_failed", { message: signError?.message ?? "no signed url" });
    return err("db_error", "Could not generate the download link. Please try again.", 500);
  }

  const response = ok<DownloadData>({ download_url: signed.signedUrl });
  await cacheResponse<ApiResponse<DownloadData>>(idemKey, { ok: true, data: { download_url: signed.signedUrl } });
  return response;
}
