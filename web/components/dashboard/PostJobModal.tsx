"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Input, Textarea, Select } from "@/components/ui/form";
import { Turnstile } from "@/components/turnstile/Turnstile";
import { JOB_TYPES, EXPERIENCE_LEVELS } from "@/lib/jobs";
import { jobSchema } from "@/lib/schemas/job";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Post-a-job modal (story-jobs-04). Adds the fields the prototype lacked (company_name,
 * expires_at) + a Turnstile widget; POSTs /api/jobs (story-jobs-03) with an Idempotency-Key.
 */
export function PostJobModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [v, setV] = useState({
    title: "",
    company_name: "",
    location: "",
    job_type: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    description: "",
    skills: "",
    expires_at: "",
  });
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.querySelector<HTMLElement>("input")?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const f = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (f.length === 0) return;
      const first = f[0]!;
      const last = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    dialog.addEventListener("keydown", onKey);
    return () => { dialog.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  function set(k: keyof typeof v, val: string) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setError(null);
    const parsed = jobSchema.safeParse({
      ...v,
      salary_min: v.salary_min === "" ? null : v.salary_min,
      salary_max: v.salary_max === "" ? null : v.salary_max,
      skills: v.skills.split(",").map((s) => s.trim()).filter(Boolean),
      turnstile_token: token,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({ ...parsed.data, expires_at: parsed.data.expires_at.toISOString() }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && json?.ok) {
        onClose();
        router.refresh();
      } else {
        setStatus("idle");
        setError("Could not post your job. Please check the fields and try again.");
      }
    } catch {
      setStatus("idle");
      setError("Something went wrong. Please try again.");
    }
  }

  const field = "w-full rounded-md border-[1.5px] border-border bg-white px-3 py-2.5 font-body text-[0.86rem] text-text focus:border-primary focus:outline-none";

  return (
    <div className="fixed inset-0 z-[200] flex items-stretch justify-center overflow-y-auto bg-[rgba(40,54,24,0.42)] backdrop-blur-sm sm:items-start sm:px-6 sm:pb-6 sm:pt-10" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="post-job-title" className="relative w-full bg-card-bg shadow-elevated sm:max-w-[600px] sm:rounded-xl sm:border sm:border-border" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-light">
          <Icon name="close" size={18} />
        </button>
        <div className="border-b border-border px-7 pb-5 pt-8 sm:px-9">
          <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">New posting</p>
          <h2 id="post-job-title" className="mt-2 font-heading text-[1.3rem] font-bold text-text">Post a job</h2>
          <p className="mt-1 font-body text-[0.85rem] text-muted">Posts go through a short admin review before going live.</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 px-7 pb-9 pt-6 sm:px-9">
          {error ? <div role="alert" className="rounded-md border-l-4 border-error bg-error-bg px-4 py-3 font-body text-[0.84rem] text-error">{error}</div> : null}
          <Input label="Job title" name="title" value={v.title} onChange={(e) => set("title", e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Company name" name="company_name" value={v.company_name} onChange={(e) => set("company_name", e.target.value)} />
            <Input label="Location" name="location" value={v.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Job type" name="job_type" value={v.job_type} onChange={(e) => set("job_type", e.target.value)}>
              <option value="">Select…</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select label="Experience" name="experience_level" value={v.experience_level} onChange={(e) => set("experience_level", e.target.value)}>
              <option value="">Select…</option>
              {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Min salary (₹/yr)" name="salary_min" type="number" value={v.salary_min} onChange={(e) => set("salary_min", e.target.value)} />
            <Input label="Max salary (₹/yr)" name="salary_max" type="number" value={v.salary_max} onChange={(e) => set("salary_max", e.target.value)} />
          </div>
          <Input label="Expires on" name="expires_at" type="date" value={v.expires_at} onChange={(e) => set("expires_at", e.target.value)} />
          <Textarea label="Description" name="description" rows={4} value={v.description} onChange={(e) => set("description", e.target.value)} />
          <Input label="Skills (comma-separated)" name="skills" value={v.skills} onChange={(e) => set("skills", e.target.value)} />
          <Turnstile onVerify={setToken} />
          <button type="submit" disabled={!token || status === "submitting"} className={`${field} mt-1 cursor-pointer border-0 bg-primary py-3.5 text-center font-heading text-[0.9rem] font-bold text-white hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50`}>
            {status === "submitting" ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      </div>
    </div>
  );
}
