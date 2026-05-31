"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { ConsultationForm } from "./ConsultationForm";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Consultation modal (services-04): ARIA dialog labelled by its H2, focus trapped inside,
 * initial focus on the first input, full-screen on mobile / centered card on desktop. Esc and
 * body-scroll-lock are owned by `ConsultationModalProvider`; this closes on overlay click and
 * (via `ConsultationForm`) on successful submit. Hosts the slim inquiry form.
 */
export function ConsultationModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Initial focus on the first input + Tab focus trap within the dialog (AC#2, AC#9).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const firstInput = dialog.querySelector<HTMLElement>("input, textarea");
    firstInput?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-stretch justify-center overflow-y-auto bg-[rgba(40,54,24,0.42)] backdrop-blur-sm sm:items-start sm:px-6 sm:pb-6 sm:pt-14"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
        className="relative flex min-h-full w-full flex-col overflow-hidden border-border bg-background shadow-elevated motion-safe:animate-modal-pop sm:min-h-0 sm:max-w-[580px] sm:rounded-xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-light hover:text-text"
        >
          <Icon name="close" size={18} />
        </button>
        <div className="border-b border-border bg-card-bg px-7 pb-5 pt-8 sm:px-9">
          <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
            Free consultation
          </p>
          <h2 id="consultation-modal-title" className="mt-2 font-display text-2xl tracking-[-0.02em] text-text">
            Tell us about your food business.
          </h2>
          <p className="mt-2 font-body text-sm text-muted">
            A 30-minute scoping call — no commitment, no pitch.
          </p>
        </div>
        <div className="bg-card-bg px-7 pb-9 pt-6 sm:px-9">
          <ConsultationForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
