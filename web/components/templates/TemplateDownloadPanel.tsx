"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Sticky download panel on the template detail page (templates-02 AC#6/#7/#8). The primary
 * button POSTs `{ template_id, email? }` to `/api/download` (templates-03) and redirects to the
 * short-lived signed URL it returns. The email field is **optional** — download works without
 * it, and the email is only sent when the visitor filled it in.
 */
export function TemplateDownloadPanel({
  templateId,
  fileType,
}: {
  templateId: string;
  fileType: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onDownload() {
    if (busy) return;
    setBusy(true);
    try {
      const body: { template_id: string; email?: string } = { template_id: templateId };
      const trimmed = email.trim();
      if (trimmed) body.email = trimmed;

      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true; data: { download_url: string } }
        | { ok: false }
        | null;
      if (json && json.ok && json.data?.download_url) {
        setDone(true);
        window.location.href = json.data.download_url;
        setTimeout(() => setDone(false), 2800);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card-bg p-7">
      {/* primary-deep on surface-light to clear the AA contrast gate (§1) */}
      <div className="mb-5 inline-flex h-[64px] w-[52px] items-center justify-center rounded-md bg-surface-light font-heading text-[0.72rem] font-bold uppercase tracking-wide text-primary-deep">
        {fileType.toUpperCase()}
      </div>

      <button
        type="button"
        onClick={onDownload}
        aria-busy={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3.5 font-heading text-[0.9rem] font-bold text-white transition hover:bg-primary-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Icon name="download" size={16} stroke={2.2} />
        {done ? "Download started ✓" : "Download template"}
      </button>

      <div className="mt-5 border-t border-border pt-5">
        <label htmlFor="template-notify-email" className="block font-body text-[0.8rem] text-muted">
          Enter your email to receive updates when this template is revised.
        </label>
        <input
          id="template-notify-email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="mt-2 w-full rounded-md border-[1.5px] border-border bg-white px-3 py-2.5 font-body text-[0.85rem] text-text focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );
}
