import { Onest } from "next/font/google";
import type { ReactNode } from "react";
import "../globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

/**
 * The guest menu has its own root layout: it sits outside the locale prefixes,
 * and `<html lang>` follows the venue rather than the site.
 */
export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} h-full antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
