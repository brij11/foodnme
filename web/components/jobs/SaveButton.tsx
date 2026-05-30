"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

type SaveState = "loading" | "anon" | "saved" | "unsaved";
type ItemType = "job" | "expert";

/**
 * Save/unsave control for a saved_items entry (story-jobs-15; generalized for experts in
 * story-experts-10). Self-contained: on mount it reads the session + the viewer's saved state
 * (RLS-scoped), then toggles via /api/saved-items. Anonymous users route to /login?redirect=….
 * `variant="detail"` is the full labelled button; "card" is a compact bookmark icon.
 */
export function SaveButton({
  itemType,
  itemId,
  variant = "detail",
  savedLabel = "Saved",
  unsavedLabel = "Save for later",
}: {
  itemType: ItemType;
  itemId: string;
  variant?: "detail" | "card";
  savedLabel?: string;
  unsavedLabel?: string;
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
        .eq("item_type", itemType)
        .eq("item_id", itemId);
      setState(count && count > 0 ? "saved" : "unsaved");
    });
  }, [itemType, itemId]);

  const saved = state === "saved";

  async function onClick() {
    if (state === "anon") {
      const path = typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    if (state === "loading") return;
    const next = !saved;
    setState(next ? "saved" : "unsaved"); // optimistic
    const res = await fetch("/api/saved-items", {
      method: next ? "POST" : "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ item_type: itemType, item_id: itemId }),
    });
    if (!res.ok) {
      setState(next ? "unsaved" : "saved"); // revert on failure
      return;
    }
    router.refresh(); // keep dependent lists/counts in sync
  }

  const noun = itemType === "expert" ? "profile" : "job";

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? `Unsave ${noun}` : `Save ${noun}`}
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
      <Icon name="bookmark" size={14} stroke={2} /> {saved ? savedLabel : unsavedLabel}
    </button>
  );
}
