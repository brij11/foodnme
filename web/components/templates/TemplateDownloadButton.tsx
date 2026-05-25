"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Round download icon-button that sits on top of a `TemplateCard`'s stretched link (templates-01
 * AC#4/#8). It POSTs to `/api/download` (templates-03) and, on success, navigates to the
 * short-lived signed URL the endpoint returns. It calls `stopPropagation`/`preventDefault` so a
 * download click never triggers the card's link to the detail page.
 *
 * The card uses a "stretched link" (an absolute overlay `<Link>`), so this control is a sibling
 * — not a button nested inside an anchor — which keeps the markup free of the nested-interactive
 * a11y violation the prototype's button-in-link would raise.
 */
export function TemplateDownloadButton({
  templateId,
  title,
}: {
  templateId: string;
  title: string;
}) {
  const [busy, setBusy] = useState(false);

  async function onDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template_id: templateId }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true; data: { download_url: string } }
        | { ok: false }
        | null;
      if (json && json.ok && json.data?.download_url) {
        window.location.href = json.data.download_url;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDownload}
      aria-label={`Download ${title}`}
      aria-busy={busy}
      className="group/dl relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted transition-colors hover:border-primary hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      <Icon name="download" size={16} stroke={2} />
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-md bg-text px-2 py-1 font-body text-[0.7rem] text-white opacity-0 transition-opacity group-hover/dl:opacity-100"
      >
        Download template
      </span>
    </button>
  );
}
