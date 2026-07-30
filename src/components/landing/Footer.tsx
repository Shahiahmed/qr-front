"use client";

import { Logo } from "@/components/landing/ui/Logo";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

export function Footer() {
  const copy = useLandingCopy();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
        {/* Top row: brand on the left, inline nav on the right. */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo size="sm" />

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {copy.footLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[15px] text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Thin baseline: centered copyright. */}
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-soft">
          {copy.footRights}
        </div>
      </div>
    </footer>
  );
}
