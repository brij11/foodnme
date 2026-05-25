"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Turnstile } from "@/components/turnstile/Turnstile";
import { Button } from "@/components/ui/Button";
import { useFooterNewsletter } from "@/components/chrome/FooterNewsletterContext";
import { cn } from "@/lib/utils/cn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NewsletterBannerProps = {
  /** Where the signup originated; passed through to newsletter_subscribers.source. */
  source: string;
  headline?: string;
  subtext?: string;
  /** Compact single-line footer variant (UI-DESIGN-HANDOFF.md §2.2 / §3). */
  mini?: boolean;
  /**
   * Whether this banner suppresses the Footer's mini newsletter (avoids two signups on one
   * page). True for any in-page banner; the Footer's own mini passes false.
   */
  suppressesFooterNewsletter?: boolean;
  className?: string;
};

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterBanner({
  source,
  headline = "Stay ahead in food technology.",
  subtext = "One short email a week — practical guidance on food safety, QC, and regulatory compliance from working practitioners.",
  mini = false,
  suppressesFooterNewsletter = true,
  className,
}: NewsletterBannerProps) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const { registerFullBanner } = useFooterNewsletter();

  // Any in-page banner registers so the Footer hides its own mini (the Footer's mini opts out).
  useEffect(() => {
    if (!suppressesFooterNewsletter) return;
    return registerFullBanner();
  }, [suppressesFooterNewsletter, registerFullBanner]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, turnstile_token: token }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(body?.error?.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className={cn(
          mini ? "py-2" : "bg-surface-light border border-border rounded-xl p-8 text-center",
          className,
        )}
        role="status"
      >
        <p className={cn("font-heading font-bold text-tag-safe-text", mini ? "text-sm" : "text-base")}>
          Subscribed — check your inbox.
        </p>
      </div>
    );
  }

  if (mini) {
    return (
      <form onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-2", className)}>
        <label htmlFor="footer-newsletter" className="font-heading text-[0.72rem] font-semibold tracking-[0.04em] uppercase text-text">
          Newsletter
        </label>
        <div className="flex gap-2">
          <input
            id="footer-newsletter"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            aria-invalid={status === "error" ? true : undefined}
            className="min-w-0 flex-1 bg-white border-[1.5px] border-border rounded-md px-3 py-2 font-body text-[0.85rem] text-text focus:outline-none focus:border-primary"
          />
          <Button type="submit" size="sm" disabled={status === "submitting"}>
            Subscribe
          </Button>
        </div>
        <Turnstile onVerify={setToken} />
        {error ? <p className="font-body text-[0.75rem] text-error">{error}</p> : <p className="font-body text-[0.72rem] text-muted">No spam. Unsubscribe anytime.</p>}
      </form>
    );
  }

  return (
    <div className={cn("bg-surface-light border border-border rounded-xl p-12", className)}>
      <div className="max-w-[560px] mx-auto text-center">
        <span className="inline-flex items-center gap-2 bg-white/70 border border-border rounded-full px-3.5 py-1.5 font-heading text-[0.7rem] font-bold tracking-[0.1em] uppercase text-text">
          <span className="w-[7px] h-[7px] rounded-full bg-secondary animate-pulse" aria-hidden />
          Weekly Newsletter
        </span>
        <h3 className="font-display text-[clamp(1.8rem,3.2vw,2.4rem)] font-semibold tracking-[-0.02em] leading-tight mt-5 mb-3 text-text">
          {headline}
        </h3>
        <p className="font-body text-[1.02rem] leading-relaxed text-muted max-w-[480px] mx-auto">{subtext}</p>
        <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col items-center gap-3">
          <div className="flex gap-2 w-full max-w-[460px] flex-col sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              aria-invalid={status === "error" ? true : undefined}
              className="flex-1 bg-white border-[1.5px] border-border rounded-md px-4 py-3 font-body text-[0.92rem] text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(76,124,89,0.12)]"
            />
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Subscribing…" : "Subscribe"}
            </Button>
          </div>
          <Turnstile onVerify={setToken} />
        </form>
        <p className="mt-3.5 font-body text-[0.78rem] text-muted">
          {error ? <span className="text-error">{error}</span> : "No spam. Unsubscribe anytime."}
        </p>
      </div>
    </div>
  );
}
