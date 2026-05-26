import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { validateUpload, UPLOAD_RULES, type UploadKind } from "@/lib/upload";
import { ok, err } from "@/lib/api";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

// Per-kind role gate (§6.2 amendment): avatar=expert, resume=seeker, template/cover=admin.
const KIND_ROLE: Record<UploadKind, "expert" | "seeker" | "admin"> = {
  avatar: "expert",
  resume: "seeker",
  template: "admin",
  cover: "admin",
};

// Only the avatars bucket exists this sprint; resume/template/cover buckets land with their stories.
const KIND_BUCKET: Record<UploadKind, string> = {
  avatar: "avatars",
  resume: "resumes",
  template: "templates",
  cover: "covers",
};

/**
 * POST /api/upload (TECHNICAL-REQUIREMENTS.md §6.2, §9.2; story-experts-05).
 * Multipart { file, kind }. Authenticated + per-kind role → magic-byte/size/MIME validation →
 * service-role upload to the requester's namespaced path → best-effort cleanup of prior files →
 * { ok, data: { url, path } }.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) return err("invalid_body", "Expected multipart form data.", 400);

  const kind = String(form.get("kind") ?? "") as UploadKind;
  const file = form.get("file");
  if (!(kind in UPLOAD_RULES)) return err("bad_kind", "Unsupported upload kind.", 400);
  if (!(file instanceof Blob)) return err("invalid_body", "Missing file.", 400);

  const auth = createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return err("unauthorized", "Sign in to upload.", 401);

  // Role gate.
  const required = KIND_ROLE[kind];
  const { data: prof } = await auth
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const allowed = required === "admin" ? !!prof?.is_admin : prof?.role === required || !!prof?.is_admin;
  if (!allowed) return err("forbidden", "You can't upload this kind of file.", 403);

  // Trust the bytes, not the declared MIME (§9.2).
  const bytes = new Uint8Array(await file.arrayBuffer());
  const v = validateUpload(kind, bytes);
  if (!v.ok) return err(v.code, v.message, v.status);

  const bucket = KIND_BUCKET[kind];
  const path = `${user.id}/${crypto.randomUUID()}.${v.ext}`;
  const svc = createServiceClient();

  const { error: upErr } = await svc.storage
    .from(bucket)
    .upload(path, bytes, { contentType: v.mime, upsert: false });
  if (upErr) {
    logError("upload.store_failed", { bucket, message: upErr.message });
    return err("upload_failed", "Could not store the file. Please try again.", 500);
  }

  // Best-effort: drop the user's prior files in this namespace so we don't accumulate orphans.
  try {
    const { data: existing } = await svc.storage.from(bucket).list(user.id);
    const stale = (existing ?? [])
      .map((o) => `${user.id}/${o.name}`)
      .filter((p) => p !== path);
    if (stale.length > 0) await svc.storage.from(bucket).remove(stale);
  } catch (e) {
    logError("upload.cleanup_failed", { error: String(e) });
  }

  const { data: pub } = svc.storage.from(bucket).getPublicUrl(path);
  return ok({ url: pub.publicUrl, path });
}
