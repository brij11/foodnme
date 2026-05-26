"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  registerSchema,
  ROLE_OPTIONS,
  type RegisterRole,
} from "@/lib/schemas/register";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

type FieldErrors = Partial<Record<"full_name" | "email" | "password" | "role", string>>;

const ROLE_ICON: Record<RegisterRole, IconName> = {
  seeker: "search",
  employer: "briefcase",
  expert: "verified",
};

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RegisterRole | "">("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [resent, setResent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const parsed = registerSchema.safeParse({ full_name: fullName, email, password, role });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({
        full_name: f.full_name?.[0],
        email: f.email?.[0],
        password: f.password?.[0],
        role: role ? f.role?.[0] : "Pick a role to continue.",
      });
      return;
    }
    setErrors({});

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.full_name, role: parsed.data.role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSubmitting(false);

    if (error) {
      if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
        setFormError("An account with this email already exists. Try signing in.");
      } else {
        setFormError(error.message);
      }
      return;
    }

    // Supabase obfuscates re-registration of an existing address by returning a user with an
    // empty `identities` array (anti-enumeration). Treat that as the duplicate case.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setFormError("An account with this email already exists. Try signing in.");
      return;
    }

    setDone(true);
  }

  async function resend() {
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
  }

  if (done) {
    return (
      <AuthShell context="register">
        <p className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Almost there
        </p>
        <h1 className="mt-2 font-heading text-[1.9rem] font-bold text-text">Check your inbox</h1>
        <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-muted">
          Check your inbox to verify your email. We sent a confirmation link to{" "}
          <strong className="text-text">{email}</strong>. You can sign in once it&apos;s verified.
        </p>
        <p className="mt-6 font-body text-[0.85rem] text-muted">
          Didn&apos;t get it? Check spam, or{" "}
          <button
            type="button"
            onClick={resend}
            disabled={resent}
            className="font-semibold text-primary underline underline-offset-2 hover:text-primary-deep disabled:no-underline disabled:opacity-70"
          >
            {resent ? "verification email sent" : "resend the link"}
          </button>
          .
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex font-body text-[0.88rem] font-semibold text-primary hover:text-primary-deep"
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell context="register">
      <p className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
        Create account
      </p>
      <h1 className="mt-2 font-heading text-[1.9rem] font-bold text-text">Join foodnme</h1>
      <p className="mt-2 font-body text-[0.92rem] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-deep">
          Sign in
        </Link>
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-5">
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <Input
          label="Full name"
          name="full_name"
          autoComplete="name"
          placeholder="Your name"
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
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((x) => ({ ...x, email: undefined }));
          }}
          error={errors.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((x) => ({ ...x, password: undefined }));
          }}
          error={errors.password}
        />

        <fieldset>
          <legend
            id="role-legend"
            className="mb-2 block font-heading text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-text"
          >
            I&apos;m joining as
          </legend>
          <div role="radiogroup" aria-labelledby="role-legend" className="grid gap-3 sm:grid-cols-3">
            {ROLE_OPTIONS.map((r) => {
              const selected = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setRole(r.value);
                    if (errors.role) setErrors((x) => ({ ...x, role: undefined }));
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-md border-[1.5px] bg-card-bg p-3.5 text-left transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    selected
                      ? "border-primary bg-tag-safe-bg"
                      : "border-border hover:border-primary",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md",
                      selected ? "bg-primary text-white" : "bg-surface-light text-primary",
                    )}
                  >
                    <Icon name={ROLE_ICON[r.value]} size={16} />
                  </span>
                  <span className="font-heading text-[0.86rem] font-bold text-text">{r.title}</span>
                  <span className="font-body text-[0.74rem] leading-snug text-muted">{r.desc}</span>
                </button>
              );
            })}
          </div>
          {errors.role ? (
            <p className="mt-1.5 font-body text-[0.78rem] text-error">{errors.role}</p>
          ) : null}
        </fieldset>

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-7 font-body text-[0.78rem] leading-relaxed text-muted">
        By creating an account, you agree to our{" "}
        <Link href="/about" className="underline underline-offset-2 hover:text-text">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/about" className="underline underline-offset-2 hover:text-text">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthShell>
  );
}
