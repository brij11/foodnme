"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ConsultationModal } from "./ConsultationModal";

type ConsultationModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const ConsultationModalContext = createContext<ConsultationModalContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function useConsultationModal() {
  return useContext(ConsultationModalContext);
}

/**
 * Global consultation modal (CLAUDE.md "providers order matters" — lives above route
 * content so the nav CTA can open it from any page). Owns open/close state, Esc-to-close
 * and body-scroll lock; the modal UI itself lives in `ConsultationModal` (fleshed out by
 * story-services-04).
 */
export function ConsultationModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <ConsultationModalContext.Provider value={value}>
      {children}
      {isOpen ? <ConsultationModal onClose={close} /> : null}
    </ConsultationModalContext.Provider>
  );
}
