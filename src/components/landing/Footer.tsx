"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/landing/ui/Logo";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

export function Footer() {
  const copy = useLandingCopy();

  return (
    <footer className="border-t border-border bg-surface pb-10 pt-14">
      <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-10 px-4 sm:px-6">
        <div className="max-w-[300px]">
          <Logo size="sm" className="mb-3.5" />
          <p className="text-[15px] leading-relaxed text-muted-soft">{copy.footTag}</p>
        </div>

        <div className="flex flex-wrap gap-10 sm:gap-14">
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-3">
              {copy.footLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[15px] text-[#5A544E] transition-colors hover:text-accent-hover"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-soft">
              {copy.footContactLabel}
            </span>
            <a
              href={`mailto:${copy.footEmail}`}
              className="inline-flex items-center gap-2 text-[15px] text-[#5A544E] transition-colors hover:text-accent-hover"
            >
              <Mail size={15} className="text-muted-soft" />
              {copy.footEmail}
            </a>
            <a
              href={`tel:${copy.footPhone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-2 text-[15px] text-[#5A544E] transition-colors hover:text-accent-hover"
            >
              <Phone size={15} className="text-muted-soft" />
              {copy.footPhone}
            </a>
            <span className="inline-flex items-center gap-2 text-[15px] text-[#5A544E]">
              <MapPin size={15} className="text-muted-soft" />
              {copy.footCity}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-9 max-w-[1180px] border-t border-border-strong px-4 pt-6 text-sm text-muted-soft sm:px-6">
        {copy.footRights}
      </div>
    </footer>
  );
}
