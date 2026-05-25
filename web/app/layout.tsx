import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Typography roles (UI-DESIGN-HANDOFF.md §1.3): Fraunces = hero H1 only,
// Inter = UI, IBM Plex Sans = body, IBM Plex Mono = code. All `display: swap`.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "foodnme",
  description: "Practical resources for a safer food ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
