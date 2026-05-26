"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ContactExpertModal } from "./ContactExpertModal";

/** Opens the contact modal (story-experts-02 wires it; story-experts-03 makes submit relay). */
export function ContactExpertButton({
  expertId,
  expertName,
  isAvailable,
}: {
  expertId: string;
  expertName: string;
  isAvailable: boolean;
}) {
  const [open, setOpen] = useState(false);
  const firstName = expertName.replace(/^(dr|mr|ms|mrs|prof)\.?\s+/i, "").split(/\s+/)[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!isAvailable}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-heading text-[0.88rem] font-bold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:bg-border disabled:text-muted"
      >
        <Icon name="mail" size={15} stroke={2} /> Contact {firstName}
      </button>
      {!isAvailable ? (
        <p className="mt-2 font-body text-[0.74rem] text-muted-2">Currently on engagement</p>
      ) : null}
      {open ? (
        <ContactExpertModal
          expertId={expertId}
          expertName={expertName}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
