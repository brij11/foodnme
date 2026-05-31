"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { Turnstile } from "@/components/turnstile/Turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NotifyStatus = "idle" | "submitting" | "success" | "error";

/**
 * Sticky download panel on the template detail page (templates-02 AC#6/#7/#8,
 * templates-06 AC#2/#3).
 *
 * The primary button POSTs `{ template_id, email? }` to `/api/download` (templates-03) and
 * redirects to the short-lived signed URL it returns.
 *
 * Below the download button, a "notify on revision" affordance lets visitors enter their email
 * and submit — on success it shows "You'll be the first to know." (DEVIATIONS B15). The notify
 * path POSTs to `/api/newsletter` with `source: "template-notify"`, reusing the existing
 * email-capture route with no new endpoint (templates-06 AC#3).
 */
export function TemplateDownloadPanel({
  templateId,
  fileType,
}: {
  templateId: string;
  fileType: string;
}) {
  const [email] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyToken, setNotifyToken] = useState("");
  const [notifyStatus, setNotifyStatus] = useState<NotifyStatus>("idle");
  const [notifyError, setNotifyError] = useState<string | null>(null);

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

  async function onNotify(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(notifyEmail)) {
      setNotifyStatus("error");
      setNotifyError("Enter a valid email.");
      return;
    }
    setNotifyStatus("submitting");
    setNotifyError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: notifyEmail,
          source: "template-notify",
          turnstile_token: notifyToken,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        setNotifyStatus("success");
      } else {
        setNotifyStatus("error");
        setNotifyError(body?.error?.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setNotifyStatus("error");
      setNotifyError("Network error. Please try again.");
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

      {/* Notify on revision (templates-06 AC#2 / DEVIATIONS B15) */}
      <div className="mt-5 border-t border-border pt-5">
        <p className="font-body text-[0.8rem] text-muted" id="notify-label">
          Get notified when this template is revised
        </p>

        {notifyStatus === "success" ? (
          <p
            className="mt-3 font-body text-[0.82rem] font-medium text-tag-safe-text"
            role="status"
            data-testid="notify-success"
          >
            You&apos;ll be the first to know.
          </p>
        ) : (
          <form
            onSubmit={onNotify}
            noValidate
            className="mt-2 flex gap-2"
            aria-labelledby="notify-label"
          >
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => {
                setNotifyEmail(e.target.value);
                if (notifyStatus !== "idle") {
                  setNotifyStatus("idle");
                  setNotifyError(null);
                }
              }}
              placeholder="you@company.com"
              aria-label="Email address for revision notifications"
              aria-invalid={notifyStatus === "error" ? true : undefined}
              className="min-w-0 flex-1 rounded-md border-[1.5px] border-border bg-white px-3 py-2 font-body text-[0.82rem] text-text focus:border-primary focus:outline-none"
              data-testid="notify-email-input"
            />
            <button
              type="submit"
              disabled={notifyStatus === "submitting"}
              className="shrink-0 rounded-md border border-border bg-white px-3.5 py-2 font-heading text-[0.82rem] font-bold text-text transition hover:border-primary hover:text-primary disabled:opacity-50"
              data-testid="notify-submit-btn"
            >
              {notifyStatus === "submitting" ? "…" : "Notify"}
            </button>
          </form>
        )}

        {notifyStatus === "error" && notifyError && (
          <p
            className="mt-1.5 font-body text-[0.75rem] text-error"
            role="alert"
            data-testid="notify-error"
          >
            {notifyError}
          </p>
        )}

        <Turnstile onVerify={setNotifyToken} className="mt-2" />
      </div>
    </div>
  );
}
