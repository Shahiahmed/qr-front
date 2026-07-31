import type { ReactNode } from "react";
import { siteFont } from "@/lib/fonts";
import "../globals.css";

/**
 * The guest menu has its own root layout: it sits outside the locale prefixes,
 * and `<html lang>` follows the venue rather than the site.
 */
export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${siteFont.variable} h-full antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
