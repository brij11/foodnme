"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resetRequestSchema, resetConfirmSchema } from "@/lib/schemas/reset-password";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type Mode = "request" | "sent" | "checking" | "confirm" | "invalid";

function ResetPassword() {
  const router = useRouter();
  const params = useSearchParams();

  // A recovery link lands here with a `?code=` (PKCE, the @supabase/ssr default) — or, for the
  // implicit-flow hash, the browser client surfaces a PASSWORD_RECOVERY event. Either path puts
  // us in confirm mode.
  const [mode, setMode] = useState<Mode>(params.get("code") ? "checking" : "request");

  // Request form
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();

  // Confirm form
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmErrors, setConfirmErrors] = useState<{ password?: string; confirm?: string }>({});
  const [confirmFormError, setConfirmFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let settled = false;
    // The @supabase/ssr browser client auto-exchanges the PKCE `?code` (and the implicit-flow
    // hash) on load, then fires PASSWORD_RECOVERY. We listen rather than exchange manually —
    // double-processing the one-time code is what caused the form to flicker/detach.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        settled = true;
        setMode("confirm");
      }
    });

    // If we arrived via a recovery link but no session materializes, the link is stale.
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (params.get("code")) {
      timer = setTimeout(() => {
        if (!settled) setMode("invalid");
      }, 6000);
    }
    return () => {
      data.subscription.unsubscribe();
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetRequestSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.flatten().fieldErrors.email?.[0]);
      return;
    }
    setEmailError(undefined);
    const supabase = createClient();
    // Fire-and-forget: never reveal whether the account exists (AC#3).
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setMode("sent");
  }

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setConfirmFormError(null);
    const parsed = resetConfirmSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setConfirmErrors({ password: f.password?.[0], confirm: f.confirm?.[0] });
      return;
    }
    setConfirmErrors({});
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setSubmitting(false);
    if (error) {
      setConfirmFormError(
        "This reset link has expired or already been used. Request a new one below.",
      );
      setMode("invalid");
      return;
    }
    router.push("/login?reset=success");
  }

  // ── Confirm: set a new password ──────────────────────────────────────────
  if (mode === "confirm" || mode === "checking") {
    return (
      <AuthShell context="reset">
        <p className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Password reset
        </p>
        <h1 className="mt-2 font-heading text-[1.9rem] font-bold text-text">Set a new password</h1>
        {mode === "checking" ? (
          <p className="mt-3 font-body text-[0.92rem] text-muted">Verifying your reset link…</p>
        ) : (
          <form onSubmit={onConfirm} noValidate className="mt-7 flex flex-col gap-5">
            <Input
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (confirmErrors.password)
                  setConfirmErrors((x) => ({ ...x, password: undefined }));
              }}
              error={confirmErrors.password}
            />
            <Input
              label="Confirm new password"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (confirmErrors.confirm) setConfirmErrors((x) => ({ ...x, confirm: undefined }));
              }}
              error={confirmErrors.confirm}
            />
            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </AuthShell>
    );
  }

  // ── Invalid / expired link ───────────────────────────────────────────────
  if (mode === "invalid") {
    return (
      <AuthShell context="reset">
        <p className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Password reset
        </p>
        <h1 className="mt-2 font-heading text-[1.9rem] font-bold text-text">Link expired</h1>
        <Alert tone="error" className="mt-6">
          {confirmFormError ??
            "This reset link is invalid or has expired. Request a fresh one below."}
        </Alert>
        <button
          type="button"
          onClick={() => setMode("request")}
          className="mt-6 inline-flex font-body text-[0.88rem] font-semibold text-primary hover:text-primary-deep"
        >
          Request a new reset link
        </button>
      </AuthShell>
    );
  }

  // ── Sent confirmation (no enumeration) ───────────────────────────────────
  if (mode === "sent") {
    return (
      <AuthShell context="reset">
        <p className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Password reset
        </p>
        <h1 className="mt-2 font-heading text-[1.9rem] font-bold text-text">Check your inbox</h1>
        <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-muted">
          If an account exists for that email, a reset link is on its way. The link expires in 30
          minutes.
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

  // ── Request a reset link ─────────────────────────────────────────────────
  return (
    <AuthShell context="reset">
      <p className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
        Password reset
      </p>
      <h1 className="mt-2 font-heading text-[1.9rem] font-bold text-text">Reset your password</h1>
      <p className="mt-2 font-body text-[0.92rem] text-muted">
        Enter the email tied to your account and we&apos;ll send a secure reset link.
      </p>
      <form onSubmit={onRequest} noValidate className="mt-7 flex flex-col gap-5">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(undefined);
          }}
          error={emailError}
        />
        <Button type="submit" size="lg" className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="mt-7 font-body text-[0.88rem] text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-deep">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
