"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

type SaveState = "loading" | "anon" | "saved" | "unsaved";

/**
 * Save/unsave control for a job (story-jobs-15). Self-contained: on mount it reads the session +
 * the viewer's saved state (RLS-scoped), then toggles via /api/saved-items. Anonymous users are
 * routed to /login?redirect=…. `variant="detail"` is the full "Save for later" button; "card" is a
 * compact bookmark icon.
 */
export function SaveButton({
  jobId,
  variant = "detail",
}: {
  jobId: string;
  variant?: "detail" | "card";
}) {
  const [state, setState] = useState<SaveState>("loading");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setState("anon");
        return;
      }
      const { count } = await supabase
        .from("saved_items")
        .select("id", { count: "exact", head: true })
        .eq("item_type", "job")
        .eq("item_id", jobId);
      setState(count && count > 0 ? "saved" : "unsaved");
    });
  }, [jobId]);

  const saved = state === "saved";

  async function onClick() {
    if (state === "anon") {
      const path = typeof window !== "undefined" ? window.location.pathname : "/jobs";
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    if (state === "loading") return;
    const next = !saved;
    setState(next ? "saved" : "unsaved"); // optimistic
    const res = await fetch("/api/saved-items", {
      method: next ? "POST" : "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ item_type: "job", item_id: jobId }),
    });
    if (!res.ok) {
      setState(next ? "unsaved" : "saved"); // revert on failure
      return;
    }
    router.refresh(); // keep the dashboard list + saved-count in sync
  }

  const label = state === "anon" ? "Save for later" : saved ? "Saved" : "Save for later";

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? "Unsave job" : "Save job"}
        data-testid="save-button"
        data-state={state}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border transition",
          saved
            ? "border-primary bg-tag-safe-bg text-primary"
            : "border-border text-muted hover:border-primary hover:text-primary",
        )}
      >
        <Icon name="bookmark" size={15} stroke={2} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      data-testid="save-button"
      data-state={state}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-md border-[1.5px] px-4 py-2.5 font-heading text-[0.82rem] font-bold transition",
        saved
          ? "border-primary bg-tag-safe-bg text-primary"
          : "border-border bg-card-bg text-primary hover:border-primary hover:bg-tag-safe-bg",
      )}
    >
      <Icon name="bookmark" size={14} stroke={2} /> {label}
    </button>
  );
}
