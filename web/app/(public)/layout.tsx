import type { ReactNode } from "react";
import { ConsultationModalProvider } from "@/components/consultation/ConsultationModalProvider";
import { FooterNewsletterProvider } from "@/components/chrome/FooterNewsletterContext";
import { Navbar } from "@/components/chrome/Navbar";
import { Footer } from "@/components/chrome/Footer";

// Public site shell. Provider order (CLAUDE.md): the global consultation modal lives
// above route content so the nav CTA can open it from any page.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ConsultationModalProvider>
      <FooterNewsletterProvider>
        <a
          href="#main"
          className="sr-only z-[300] rounded bg-primary px-4 py-2 font-heading text-sm font-bold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <Footer />
      </FooterNewsletterProvider>
    </ConsultationModalProvider>
  );
}
