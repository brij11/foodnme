"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Input, Textarea, Select } from "@/components/ui/form";
import { Turnstile } from "@/components/turnstile/Turnstile";
import { expertInquirySchema, EXPERT_INQUIRY_FIELDS } from "@/lib/schemas/expert-inquiry";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

type Field = (typeof EXPERT_INQUIRY_FIELDS)[number];
type Errors = Partial<Record<Field, string>>;

/**
 * Contact-expert modal (story-experts-03): ARIA dialog, focus-trapped, Esc / overlay / success
 * closes it. Relays a short message to the expert via POST /api/expert-inquiry — the visitor
 * never sees the expert's email (anti-harvesting). Turnstile-gated, Zod-validated.
 */
export function ContactExpertModal({
  expertId,
  expertName,
  onClose,
}: {
  expertId: string;
  expertName: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [engagementType, setEngagementType] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.querySelector<HTMLElement>("input, textarea")?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setErrorMsg(null);

    const parsed = expertInquirySchema.safeParse({
      expert_id: expertId,
      full_name: fullName,
      email,
      company_name: companyName,
      engagement_type: engagementType,
      message,
      turnstile_token: token,
    });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ full_name: f.full_name?.[0], email: f.email?.[0], message: f.message?.[0] });
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/expert-inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && json?.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg("We couldn't deliver your message. Please try again in a moment.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("We couldn't deliver your message. Please try again in a moment.");
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
        aria-labelledby="contact-expert-title"
        className="relative flex min-h-full w-full flex-col overflow-hidden bg-card-bg shadow-elevated motion-safe:animate-modal-pop sm:min-h-0 sm:max-w-[560px] sm:rounded-xl sm:border sm:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-light hover:text-text"
        >
          <Icon name="close" size={18} />
        </button>

        {status === "success" ? (
          <div className="px-8 py-12 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tag-safe-bg text-tag-safe-text">
              <Icon name="check" size={28} stroke={2.4} />
            </div>
            <p className="mt-5 font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
              Message delivered
            </p>
            <h2 id="contact-expert-title" className="mt-2 font-heading text-[1.4rem] font-bold text-text">
              Reaching out to {expertName.split(" ").slice(-1)[0]}
            </h2>
            <p className="mx-auto mt-3 max-w-[380px] font-body text-[0.95rem] leading-relaxed text-muted">
              We&apos;ve passed your message along. They typically respond within 24 hours, directly
              to your email.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 inline-flex items-center justify-center rounded-md border-[1.5px] border-border bg-card-bg px-6 py-2.5 font-heading text-[0.82rem] font-bold text-primary transition hover:border-primary hover:bg-tag-safe-bg"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-7 pb-5 pt-8 sm:px-9">
              <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
                Contact
              </p>
              <h2 id="contact-expert-title" className="mt-2 font-heading text-[1.3rem] font-bold text-text">
                Message {expertName}
              </h2>
              <p className="mt-1.5 font-body text-[0.85rem] text-muted">
                Your message goes straight to their inbox — your email is the reply address.
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 px-7 pb-9 pt-6 sm:px-9">
              {errorMsg ? (
                <div
                  role="alert"
                  className="rounded-md border-l-4 border-error bg-error-bg px-4 py-3 font-body text-[0.86rem] text-error"
                >
                  {errorMsg}
                </div>
              ) : null}

              <Input
                label="Your name"
                name="full_name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.full_name) setErrors((x) => ({ ...x, full_name: undefined }));
                }}
                error={errors.full_name}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((x) => ({ ...x, email: undefined }));
                }}
                error={errors.email}
              />
              <Input
                label="Company (optional)"
                name="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company or brand"
              />
              <Select
                label="Engagement type (optional)"
                name="engagement_type"
                value={engagementType}
                onChange={(e) => setEngagementType(e.target.value)}
              >
                <option value="">Not sure yet</option>
                <option value="hourly">Hourly consult (30-60 min)</option>
                <option value="project">Project engagement (2-6 weeks)</option>
                <option value="retainer">Retainer (ongoing)</option>
              </Select>
              <Textarea
                label="What do you need help with?"
                name="message"
                rows={4}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((x) => ({ ...x, message: undefined }));
                }}
                error={errors.message}
                placeholder="Share your facility, products, and what you're hoping to accomplish."
              />

              <Turnstile onVerify={setToken} />

              <button
                type="submit"
                disabled={!token || status === "submitting"}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3.5 font-heading text-[0.9rem] font-bold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitting" ? "Sending…" : "Send message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
