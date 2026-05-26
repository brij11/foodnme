"use client";

import { useRef, useState } from "react";
import { Input, Textarea } from "@/components/ui/form";
import { Turnstile } from "@/components/turnstile/Turnstile";
import { consultationSchema, CONSULTATION_SERVICE } from "@/lib/schemas/inquiry";

type Field = "full_name" | "email" | "message";
const FIELDS: Field[] = ["full_name", "email", "message"];
const EMPTY: Record<Field, string> = { full_name: "", email: "", message: "" };

/**
 * Slim consultation form inside the modal (services-04). Reuses `consultationSchema` (picked
 * from the shared inquiry schema, so `message` min 20 still applies) and submits to the same
 * `/api/inquiry` with `service_needed='Consultation (from modal)'` + `source='consultation_modal'`.
 * On success it shows a confirmation then calls `onClose` after 2 seconds (AC#7).
 */
export function ConsultationForm({ onClose }: { onClose: () => void }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const refs: Record<Field, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = {
    full_name: useRef(null),
    email: useRef(null),
    message: useRef(null),
  };

  function set(name: Field, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validateField(name: Field) {
    const result = consultationSchema.shape[name].safeParse(values[name]);
    setErrors((e) => ({ ...e, [name]: result.success ? undefined : result.error.issues[0]?.message }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    const parsed = consultationSchema.safeParse({ ...values, turnstile_token: token });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: Partial<Record<Field, string>> = {};
      for (const f of FIELDS) {
        const msg = fieldErrors[f]?.[0];
        if (msg) next[f] = msg;
      }
      setErrors(next);
      const first = FIELDS.find((f) => next[f]);
      if (first) refs[first].current?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({
          ...parsed.data,
          service_needed: CONSULTATION_SERVICE,
          source: "consultation_modal",
        }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && json?.ok) {
        setStatus("success");
        setTimeout(onClose, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-lg border-l-4 border-secondary bg-tag-safe-bg px-5 py-6 text-tag-safe-text">
        <h3 className="font-heading text-[1.05rem] font-bold">Inquiry received.</h3>
        <p className="mt-1 font-body text-[0.9rem]">We&apos;ll respond within 24 hours. Closing…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {status === "error" ? (
        <div role="alert" className="rounded-md border-l-4 border-error bg-[rgba(185,28,28,0.06)] px-4 py-3 font-body text-[0.84rem] text-error">
          Something went wrong sending your inquiry. Your details are still here — please try again.
        </div>
      ) : null}

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
      <Textarea
        ref={refs.message as React.RefObject<HTMLTextAreaElement>}
        label="What do you need help with?"
        name="message"
        rows={4}
        value={values.message}
        onChange={(e) => set("message", e.target.value)}
        onBlur={() => validateField("message")}
        error={errors.message}
        placeholder="A sentence or two about your facility, products, and what's prompting this."
      />

      <Turnstile onVerify={setToken} />

      <button
        type="submit"
        disabled={!token || status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 font-heading text-[0.88rem] font-bold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Request consultation"}
      </button>
    </form>
  );
}
