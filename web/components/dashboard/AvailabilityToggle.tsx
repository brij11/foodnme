"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * Availability switch (story-experts-06). PATCHes /api/experts/:id/availability and reflects the
 * resolved value; refreshes server data so the directory state stays consistent.
 */
export function AvailabilityToggle({
  expertId,
  initial,
}: {
  expertId: string;
  initial: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (saving) return;
    const next = !on;
    setSaving(true);
    try {
      const res = await fetch(`/api/experts/${expertId}/availability`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_available: next }),
      });
      if (res.ok) {
        setOn(next);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card-bg px-5 py-4">
      <span className="flex items-center gap-2 font-body text-[0.9rem] text-text">
        <span
          aria-hidden
          className={cn("h-2.5 w-2.5 rounded-full", on ? "bg-secondary" : "bg-muted-2")}
        />
        {on ? "Available for work" : "Not available"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Available for work"
        disabled={saving}
        onClick={toggle}
        className={cn(
          "relative ml-auto h-6 w-11 rounded-full transition disabled:opacity-60",
          on ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
