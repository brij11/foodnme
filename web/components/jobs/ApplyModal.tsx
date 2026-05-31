"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Textarea } from "@/components/ui/form";
import { Turnstile } from "@/components/turnstile/Turnstile";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Apply-to-job modal (story-jobs-05): resume upload + cover note, Turnstile-gated. Submit uploads
 * the resume via POST /api/upload (kind=resume) then POSTs /api/applications (story-jobs-06) with
 * an Idempotency-Key. Focus-trapped ARIA dialog; Esc / overlay / success closes it.
 */
export function ApplyModal({
  jobId,
  jobTitle,
  onClose,
}: {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.querySelector<HTMLElement>("input, textarea")?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const f = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (f.length === 0) return;
      const first = f[0]!;
      const last = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (f && f.size > MAX_BYTES) {
      setError("Resume must be under 10 MB.");
      e.target.value = "";
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setError(null);
    if (!file) return setError("Attach your resume (PDF or DOCX).");
    if (!token) return setError("Please complete the verification.");

    setStatus("submitting");
    try {
      // Step 1: upload the resume.
      const fd = new FormData();
      fd.set("kind", "resume");
      fd.set("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upJson = (await up.json().catch(() => null)) as
        | { ok: true; data: { url: string } }
        | { ok: false; error: { message: string } }
        | null;
      if (!up.ok || !upJson?.ok) {
        setStatus("error");
        return setError((upJson && !upJson.ok && upJson.error?.message) || "Resume upload failed.");
      }

      // Step 2: record the application.
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({
          job_id: jobId,
          resume_url: upJson.data.url,
          cover_note: coverNote,
          turnstile_token: token,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error: { code: string; message: string } }
        | null;
      if (res.ok && json?.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        // Orphan file (upload succeeded, application failed) is flagged server-side in prod.
        setError((json && !json.ok && json.error?.message) || "Could not submit your application.");
      }
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-stretch justify-center overflow-y-auto bg-[rgba(40,54,24,0.42)] backdrop-blur-sm sm:items-start sm:px-6 sm:pb-6 sm:pt-14"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        className="relative flex min-h-full w-full flex-col overflow-hidden bg-card-bg shadow-elevated motion-safe:animate-modal-pop sm:min-h-0 sm:max-w-[560px] sm:rounded-xl sm:border sm:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-light hover:text-text">
          <Icon name="close" size={18} />
        </button>

        {status === "success" ? (
          <div className="px-8 py-12 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tag-safe-bg text-tag-safe-text">
              <Icon name="check" size={28} stroke={2.4} />
            </div>
            <h2 id="apply-modal-title" className="mt-5 font-heading text-[1.4rem] font-bold text-text">
              Application submitted
            </h2>
            <p className="mx-auto mt-3 max-w-[380px] font-body text-[0.95rem] text-muted">
              The employer will be in touch. You can track this in your dashboard.
            </p>
            <button type="button" onClick={onClose} className="mt-7 rounded-md border-[1.5px] border-border px-6 py-2.5 font-heading text-[0.82rem] font-bold text-primary hover:border-primary">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-7 pb-5 pt-8 sm:px-9">
              <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">Apply</p>
              <h2 id="apply-modal-title" className="mt-2 font-heading text-[1.3rem] font-bold text-text">{jobTitle}</h2>
            </div>
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 px-7 pb-9 pt-6 sm:px-9">
              {error ? (
                <div role="alert" className="rounded-md border-l-4 border-error bg-error-bg px-4 py-3 font-body text-[0.86rem] text-error">
                  {error}
                </div>
              ) : null}

              <div>
                <label htmlFor="resume" className="mb-2 block font-heading text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-text">
                  Resume (PDF or DOCX, ≤10 MB)
                </label>
                <input id="resume" data-testid="resume-input" type="file" accept={ACCEPT} onChange={pickFile} className="block w-full font-body text-[0.85rem] text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:font-heading file:text-[0.78rem] file:font-bold file:text-white" />
              </div>

              <div>
                <Textarea
                  label="Cover note"
                  name="cover_note"
                  rows={4}
                  maxLength={2000}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="A short note on why you're a fit (optional)."
                />
                <p className="mt-1 text-right font-body text-[0.72rem] text-muted-2">{coverNote.length}/2000</p>
              </div>

              <Turnstile onVerify={setToken} />

              <button type="submit" disabled={status === "submitting"} className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3.5 font-heading text-[0.9rem] font-bold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50">
                {status === "submitting" ? "Submitting…" : "Submit application"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
