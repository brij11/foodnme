"use client";

import { Icon } from "@/components/ui/Icon";

/**
 * Consultation modal shell. This skeleton (story-homepage-02) provides the accessible
 * dialog chrome — backdrop, ARIA dialog, labelled heading, close button — so the nav CTA
 * has something to open. story-services-04 replaces the body with the slim inquiry form
 * (Full Name / Business Email / Message + Turnstile) and the submit → /api/inquiry flow.
 */
export function ConsultationModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[rgba(40,54,24,0.42)] px-6 pt-14 pb-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
        className="relative w-full max-w-[580px] overflow-hidden rounded-xl border border-border bg-background shadow-elevated"
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
        <div className="border-b border-border bg-card-bg px-9 pb-5 pt-8">
          <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
            Free consultation
          </p>
          <h2 id="consultation-modal-title" className="mt-2 font-display text-2xl tracking-[-0.02em] text-text">
            Tell us about your food business.
          </h2>
        </div>
        <div className="bg-card-bg px-9 pb-9 pt-6">
          <p className="font-body text-sm text-muted">
            A 30-minute scoping call — no commitment, no pitch. The inquiry form lands here.
          </p>
        </div>
      </div>
    </div>
  );
}
