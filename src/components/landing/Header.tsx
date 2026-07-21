"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { LanguageSwitch } from "@/components/landing/ui/LanguageSwitch";
import { Logo } from "@/components/landing/ui/Logo";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

export function Header() {
  const copy = useLandingCopy();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape and once the viewport reaches the lg nav.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onChange);
    };
  }, [open]);

  const navLinks = [
    { label: copy.hiwKicker, href: "#how" },
    { label: copy.advKicker, href: "#benefits" },
    { label: copy.demoKicker, href: "#demo" },
    { label: copy.priceKicker, href: "#pricing" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-white/80 shadow-[0_1px_20px_-8px_rgba(20,18,16,0.18)] backdrop-blur-xl"
          : "border-b border-transparent bg-white/50 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
        <Logo />

        {/*
          Full nav waits for xl: at lg the Kazakh labels ("Қалай жұмыс істейді")
          wrap onto a second line and stretch the bar. Below xl the burger holds
          the same links.
        */}
        <nav aria-label="Основная навигация" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <LanguageSwitch />
          {/*
            Responsive visibility lives on the wrapper, not on the Button.
            Button's base classes hardcode `inline-flex`, which sits after
            `hidden` in Tailwind's output and would win — so `hidden` passed
            through `className` silently does nothing.
          */}
          <span className="hidden xl:inline-flex">
            <Button
              variant="ghost"
              href="#cta"
              className="px-3 py-2.5 text-[15px] font-semibold"
            >
              {copy.navLogin}
            </Button>
          </span>

          {/* Visible from sm up; below that the CTA lives inside the burger panel. */}
          <span className="hidden shrink-0 sm:inline-flex">
            <Button
              variant="primary"
              href="#cta"
              className="whitespace-nowrap px-3.5 py-2.5 text-[13px] xl:px-5 xl:text-[15px]"
            >
              {copy.navTry}
            </Button>
          </span>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? copy.navMenuClose : copy.navMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-strong text-foreground transition-colors hover:bg-surface-2 xl:hidden"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label={copy.navMenuOpen}
          className="max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-border bg-white px-4 pb-6 pt-3 sm:px-6 xl:hidden"
        >
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-base font-semibold text-foreground transition-colors hover:bg-surface-2"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2.5 border-t border-border pt-4 sm:flex-row">
            <Button
              variant="secondary"
              href="#cta"
              onClick={() => setOpen(false)}
              className="w-full py-3.5 text-base sm:flex-1"
            >
              {copy.navLogin}
            </Button>
            <Button
              variant="primary"
              href="#cta"
              onClick={() => setOpen(false)}
              className="w-full py-3.5 text-base sm:flex-1"
            >
              {copy.navTry}
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
