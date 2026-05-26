"use client";

import { useRef, useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/form";
import { Turnstile } from "@/components/turnstile/Turnstile";
import { SERVICES } from "@/lib/services";
import { inquirySchema, INQUIRY_FIELDS } from "@/lib/schemas/inquiry";

type Field = (typeof INQUIRY_FIELDS)[number];
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = { full_name: "", email: "", company_name: "", service_needed: "", message: "" };

/**
 * Services inquiry form (services-02). Shared, Turnstile-gated, Zod-validated (the same
 * `inquirySchema` the API route uses). Reused inside the consultation modal (services-04) — the
 * optional `source` is forwarded to the API so inquiries can be attributed to their surface.
 * Submit POSTs `/api/inquiry` (services-03) with an `Idempotency-Key` to dedupe double-clicks.
 */
export function InquiryForm({ source }: { source?: string }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const refs: Record<Field, React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>> = {
    full_name: useRef(null),
    email: useRef(null),
    company_name: useRef(null),
    service_needed: useRef(null),
    message: useRef(null),
  };

  function set(name: Field, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  // On blur: validate just the blurred field (AC#3 — errors appear before submit).
  function validateField(name: Field) {
    const result = inquirySchema.shape[name].safeParse(values[name]);
    setErrors((e) => ({ ...e, [name]: result.success ? undefined : result.error.issues[0]?.message }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    const parsed = inquirySchema.safeParse({ ...values, turnstile_token: token });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: Errors = {};
      for (const f of INQUIRY_FIELDS) {
        const msg = fieldErrors[f]?.[0];
        if (msg) next[f] = msg;
      }
      setErrors(next);
      // Focus the first field (in order) that has an error (AC#10).
      const first = INQUIRY_FIELDS.find((f) => next[f]);
      if (first) refs[first].current?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({ ...parsed.data, ...(source ? { source } : {}) }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && json?.ok) {
        setStatus("success");
        setValues(EMPTY);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border-l-4 border-secondary bg-tag-safe-bg px-6 py-8 text-tag-safe-text"
      >
        <h3 className="font-heading text-[1.1rem] font-bold">Inquiry received.</h3>
        <p className="mt-1 font-body text-[0.95rem]">
          We received your inquiry — we&apos;ll respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {status === "error" ? (
        <div role="alert" className="rounded-md border-l-4 border-error bg-[rgba(185,28,28,0.06)] px-4 py-3 font-body text-[0.86rem] text-error">
          Something went wrong sending your inquiry. Your details are still here — please try again.
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          ref={refs.full_name as React.RefObject<HTMLInputElement>}
          label="Full name"
          name="full_name"
          value={values.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          onBlur={() => validateField("full_name")}
          error={errors.full_name}
        />
        <Input
          ref={refs.email as React.RefObject<HTMLInputElement>}
          label="Business email"
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => validateField("email")}
          error={errors.email}
        />
        <Input
          ref={refs.company_name as React.RefObject<HTMLInputElement>}
          label="Company name"
          name="company_name"
          value={values.company_name}
          onChange={(e) => set("company_name", e.target.value)}
          onBlur={() => validateField("company_name")}
          error={errors.company_name}
        />
        <Select
          ref={refs.service_needed as React.RefObject<HTMLSelectElement>}
          label="Service needed"
          name="service_needed"
          value={values.service_needed}
          onChange={(e) => set("service_needed", e.target.value)}
          onBlur={() => validateField("service_needed")}
          error={errors.service_needed}
        >
          <option value="">Select a service…</option>
          {SERVICES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        ref={refs.message as React.RefObject<HTMLTextAreaElement>}
        label="Describe your challenge"
        name="message"
        rows={4}
        value={values.message}
        onChange={(e) => set("message", e.target.value)}
        onBlur={() => validateField("message")}
        error={errors.message}
        placeholder="What kind of facility, products, and what's prompting this inquiry?"
      />

      <Turnstile onVerify={setToken} />

      <div>
        <button
          type="submit"
          disabled={!token || status === "submitting"}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3.5 font-heading text-[0.9rem] font-bold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Send my inquiry"}
        </button>
        <p className="mt-3 text-center font-body text-[0.78rem] text-muted">
          We respond within 24 hours. No commitment required.
        </p>
      </div>
    </form>
  );
}
