"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/listing/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import type { ExpertInquiry } from "./ExpertDashboard";

const ENGAGEMENT_LABEL: Record<string, string> = {
  hourly: "Hourly consult",
  project: "Project engagement",
  retainer: "Retainer",
};

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * Expert dashboard inquiries inbox (story-experts-11). Lists the signed-in expert's own
 * inquiries (RLS-scoped); unread rows are visually marked and can be marked read — an
 * RLS-scoped `update is_read` via the browser client (only the owning expert is permitted).
 */
export function InquiriesInbox({ initial }: { initial: ExpertInquiry[] }) {
  const [items, setItems] = useState<ExpertInquiry[]>(initial);

  async function markRead(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: true } : i)));
    const supabase = createClient();
    await supabase.from("expert_inquiries").update({ is_read: true }).eq("id", id);
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No inquiries yet"
        message="When a business contacts you through your profile, the message arrives here and in your email."
        action={{ label: "View the experts directory", href: "/experts" }}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3" data-testid="inquiries-list">
      {items.map((inq) => (
        <li
          key={inq.id}
          data-testid="inquiry-row"
          data-unread={!inq.is_read}
          className={cn(
            "rounded-lg border bg-card-bg p-5",
            inq.is_read ? "border-border" : "border-primary/40 bg-tag-safe-bg/40",
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            {!inq.is_read ? (
              <span
                aria-label="Unread"
                className="h-2 w-2 shrink-0 rounded-full bg-primary"
              />
            ) : null}
            <span className="font-heading text-[0.95rem] font-bold text-text">{inq.sender_name}</span>
            {inq.company_name ? (
              <span className="font-body text-[0.82rem] text-muted">· {inq.company_name}</span>
            ) : null}
            {inq.engagement_type ? (
              <span className="rounded-full bg-tag-safe-bg px-2 py-0.5 font-heading text-[0.7rem] font-bold text-tag-safe-text">
                {ENGAGEMENT_LABEL[inq.engagement_type] ?? inq.engagement_type}
              </span>
            ) : null}
            <span className="ml-auto font-body text-[0.75rem] text-muted">
              {formatWhen(inq.created_at)}
            </span>
          </div>
          <p className="mt-2 font-body text-[0.88rem] leading-relaxed text-text/90">{inq.message}</p>
          <div className="mt-3 flex items-center gap-4">
            <a
              href={`mailto:${inq.sender_email}`}
              className="inline-flex items-center gap-1.5 font-heading text-[0.78rem] font-bold text-primary hover:text-primary-deep"
            >
              <Icon name="mail" size={13} stroke={2} /> Reply
            </a>
            {!inq.is_read ? (
              <button
                type="button"
                onClick={() => markRead(inq.id)}
                className="font-heading text-[0.78rem] font-bold text-muted hover:text-text"
              >
                Mark as read
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
