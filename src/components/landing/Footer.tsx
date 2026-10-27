"use client";

import { MessageCircle, Send } from "lucide-react";
import { Logo } from "@/components/landing/ui/Logo";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";
import { TELEGRAM_USERNAME, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/content/landing";

export function Footer() {
  const copy = useLandingCopy();
  // «Контакты» gets its own column with real contacts, so the old #cta anchor
  // (which pointed at the sign-up banner) is dropped from the product links.
  const productLinks = copy.footLinks.filter((link) => link.href !== "#cta");

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6 lg:py-16">
        <div>
          {/* Logo's wordmark reads --foreground; flip it to white on ink. */}
          <div className="[--foreground:#ffffff]">
            <Logo size="sm" />
          </div>
          <p className="mt-5 text-sm text-[var(--on-dark-muted)]">{copy.footRights}</p>
        </div>

        <nav aria-labelledby="foot-product">
          <h2 id="foot-product" className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--on-dark-muted)]">
            {copy.footProduct}
          </h2>
          <ul className="flex flex-col gap-1">
            {productLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-[15px] text-white transition-colors hover:text-[var(--on-dark-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--on-dark-accent)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--on-dark-muted)]">
            {copy.footContacts}
          </h2>
          {/* TODO: email — добавить, когда будет адрес. */}
          <div className="flex flex-col gap-1">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-[15px] text-white transition-colors hover:text-[var(--on-dark-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--on-dark-accent)]"
            >
              <MessageCircle size={18} aria-hidden="true" />
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <a
              href={`https://t.me/${TELEGRAM_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-[15px] text-white transition-colors hover:text-[var(--on-dark-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--on-dark-accent)]"
            >
              <Send size={18} aria-hidden="true" />
              Telegram @{TELEGRAM_USERNAME}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
