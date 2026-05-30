"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

// Outline-small chip styling shared by the copy button and the share links so the row reads
// as one control group (matches the prototype `ShareRow` secondary buttons).
const CHIP =
  "inline-flex items-center gap-1.5 rounded-sm border-[1.5px] border-border bg-card-bg px-3.5 py-2 " +
  "font-heading text-[0.72rem] font-bold text-primary transition hover:border-primary hover:bg-tag-safe-bg " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background";

/**
 * Article share row (story-blog-08, prototype `screens-blog.jsx` `ShareRow`): Copy link +
 * LinkedIn / Twitter-X / Email share intents. Client island — share URLs are derived from the
 * canonical `window.location.href` on mount; "Copy link" writes it to the clipboard with a
 * transient confirmation and a graceful fallback when the clipboard API is unavailable.
 */
export function ShareRow({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard?.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (insecure context / permissions) — fail quietly, no confirmation.
    }
  }

  const enc = encodeURIComponent;
  const shareUrl = url || "";
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`;
  const twitter = `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(title)}`;
  const email = `mailto:?subject=${enc(title)}&body=${enc(shareUrl)}`;

  return (
    <div className="mx-auto mt-7 flex max-w-article flex-wrap items-center gap-3">
      <span className="font-body text-[0.8rem] text-muted">Share this article:</span>
      <button type="button" className={CHIP} onClick={copy} aria-label="Copy link to this article">
        <Icon name={copied ? "check" : "file"} size={13} stroke={2} />
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={CHIP}
        aria-label="Share on LinkedIn"
      >
        <Icon name="linkedin" size={13} />
        LinkedIn
      </a>
      <a
        href={twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={CHIP}
        aria-label="Share on Twitter"
      >
        <Icon name="twitter" size={13} />
        Twitter
      </a>
      <a href={email} className={CHIP} aria-label="Share by email">
        <Icon name="mail" size={13} stroke={2} />
        Email
      </a>
    </div>
  );
}
