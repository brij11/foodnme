"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/schemas/login";
import { safeRedirect } from "@/lib/utils/redirect";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type FieldErrors = { email?: string; password?: string };

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // "Keep me signed in for 30 days" — checked by default, parity with the prototype
  // (DEVIATIONS B6; design/screens-auth.jsx:86-88).
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  // The email_not_confirmed case is the one exception to the generic-error rule
  // (story-auth-01 AC#4) — surface a verify prompt + resend instead.
  const [unverified, setUnverified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Resend cooldown mirrors Supabase's send window with a 30s button disable (story-auth-03 AC#5).
  const [cooldown, setCooldown] = useState(0);

  // An expired/used verification link bounces back here (story-auth-03 AC#3).
  const verificationFailed = params.get("error") === "verification_failed";
  // A completed password reset lands here (story-auth-04 AC#7).
  const resetSuccess = params.get("reset") === "success";

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);
    setUnverified(false);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ email: f.email?.[0], password: f.password?.[0] });
      return;
    }
    setErrors({});

    setSubmitting(true);
    // The checkbox controls the auth-cookie lifetime: persistent (30 days) when checked,
    // a browser-session cookie when unchecked (story-auth-09 AC#2, #3).
    const supabase = createClient({ persistent: keepSignedIn });
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      setSubmitting(false);
      const code = error.code ?? "";
      const notConfirmed =
        code === "email_not_confirmed" || /not confirmed/i.test(error.message);
      if (notConfirmed) {
        setUnverified(true);
      } else {
        // Never disambiguate email-vs-password (AC#4).
        setFormError("Invalid email or password.");
      }
      return;
    }

    // Success — honor an internal ?redirect=, else /dashboard (AC#3, AC#5).
    const target = safeRedirect(params.get("redirect"));
    router.push(target);
    router.refresh();
  }

  async function resendVerification() {
    if (cooldown > 0) return;
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setCooldown(30);
  }

  return (
    <AuthShell context="login">
      <p className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
        Sign in
      </p>
      <h1 className="mt-2 font-heading text-[1.9rem] font-bold text-text">Welcome back</h1>
      <p className="mt-2 font-body text-[0.92rem] text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:text-primary-deep">
          Create one
        </Link>
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-5">
        {resetSuccess ? (
          <Alert tone="success">
            Your password has been reset. Sign in with your new password.
          </Alert>
        ) : null}

        {verificationFailed && !unverified ? (
          <Alert tone="warning">
            That verification link is invalid or has expired. Sign in to request a new one.
          </Alert>
        ) : null}

        {formError ? <Alert tone="error">{formError}</Alert> : null}

        {unverified ? (
          <Alert tone="warning">
            Please verify your email — check your inbox or{" "}
            <button
              type="button"
              onClick={resendVerification}
              disabled={cooldown > 0}
              className="font-semibold underline underline-offset-2 disabled:no-underline disabled:opacity-70"
            >
              {cooldown > 0 ? `resend in ${cooldown}s` : "resend the link"}
            </button>
            .
          </Alert>
        ) : null}

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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-text">
              Password
            </span>
            <Link
              href="/reset-password"
              className="font-body text-[0.74rem] font-semibold text-primary hover:text-primary-deep"
            >
              Forgot?
            </Link>
          </div>
          <Input
            name="password"
            type="password"
            aria-label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((x) => ({ ...x, password: undefined }));
            }}
            error={errors.password}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 font-body text-[0.84rem] text-text">
          <input
            type="checkbox"
            name="keep-signed-in"
            checked={keepSignedIn}
            onChange={(e) => setKeepSignedIn(e.target.checked)}
            className="h-[1.05rem] w-[1.05rem] cursor-pointer rounded-[4px] border-[1.5px] border-border accent-primary"
          />
          Keep me signed in for 30 days
        </label>

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-7 font-body text-[0.78rem] leading-relaxed text-muted">
        By signing in, you agree to our{" "}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
