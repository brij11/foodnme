import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "foodnme",
  description: "Practical resources for a safer food ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
