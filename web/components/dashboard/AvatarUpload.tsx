"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { expertInitials } from "@/lib/experts";

/**
 * Avatar uploader (story-experts-05): posts the chosen image to POST /api/upload (kind=avatar),
 * which validates magic-bytes/size/MIME server-side, then reports the public URL back to the
 * profile form (saved into experts.avatar_url on profile save).
 */
export function AvatarUpload({
  fullName,
  value,
  onChange,
}: {
  fullName: string;
  value: string | null;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError(null);
    const fd = new FormData();
    fd.set("kind", "avatar");
    fd.set("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = (await res.json().catch(() => null)) as
        | { ok: true; data: { url: string } }
        | { ok: false; error: { message: string } }
        | null;
      if (res.ok && json?.ok) {
        onChange(json.data.url);
        setStatus("idle");
      } else {
        setStatus("error");
        setError((json && !json.ok && json.error?.message) || "Upload failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Upload failed. Please try again.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[1.1rem] font-bold text-tag-safe-text">
          {expertInitials(fullName)}
        </div>
      )}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-border bg-card-bg px-3.5 py-2 font-heading text-[0.78rem] font-bold text-primary transition hover:border-primary disabled:opacity-60"
        >
          <Icon name="upload" size={13} stroke={2} />
          {status === "uploading" ? "Uploading…" : "Change photo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={onFile}
          data-testid="avatar-input"
        />
        <p className="mt-2 font-body text-[0.74rem] text-muted">JPG, PNG, or WebP · up to 2 MB</p>
        {error ? <p className="mt-1 font-body text-[0.74rem] text-error">{error}</p> : null}
      </div>
    </div>
  );
}
