/**
 * Upload validation (TECHNICAL-REQUIREMENTS.md §9.2, story-experts-05). Per-kind MIME whitelist,
 * size cap, and magic-byte sniffing — the declared MIME is never trusted; the actual leading
 * bytes decide. Shared by `POST /api/upload` across kinds (avatar now; resume/template later).
 */
export type UploadKind = "avatar" | "resume" | "template" | "cover";

type KindRule = { mimes: string[]; maxBytes: number };

export const UPLOAD_RULES: Record<UploadKind, KindRule> = {
  avatar: { mimes: ["image/png", "image/jpeg", "image/webp"], maxBytes: 2 * 1024 * 1024 },
  cover: { mimes: ["image/png", "image/jpeg", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  resume: {
    mimes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxBytes: 10 * 1024 * 1024,
  },
  template: {
    mimes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxBytes: 10 * 1024 * 1024,
  },
};

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

/** Sniffs the real content type from leading bytes; null when unrecognized. */
export function detectMime(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return "image/png";
  }
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return "image/jpeg";
  }
  // RIFF....WEBP
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return "image/webp";
  }
  if (b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) {
    return "application/pdf";
  }
  // ZIP container (PK\x03\x04) → docx is a zip; treat as the office wordprocessing type.
  if (b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return null;
}

export type UploadValidation =
  | { ok: true; mime: string; ext: string }
  | { ok: false; code: string; message: string; status: number };

/** Validates size → magic-bytes → MIME-whitelist for a kind. */
export function validateUpload(kind: UploadKind, bytes: Uint8Array): UploadValidation {
  const rule = UPLOAD_RULES[kind];
  if (!rule) return { ok: false, code: "bad_kind", message: "Unsupported upload kind.", status: 400 };
  if (bytes.byteLength > rule.maxBytes) {
    const mb = Math.round(rule.maxBytes / (1024 * 1024));
    return { ok: false, code: "too_large", message: `File exceeds the ${mb} MB limit.`, status: 413 };
  }
  const mime = detectMime(bytes);
  if (!mime || !rule.mimes.includes(mime)) {
    return {
      ok: false,
      code: "bad_type",
      message: "That file type isn't allowed for this upload.",
      status: 415,
    };
  }
  return { ok: true, mime, ext: EXT[mime] ?? "bin" };
}
