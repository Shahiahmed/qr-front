import type { Locale } from "@/content/landing";

/**
 * Inline-SVG flags for the language switcher. Emoji flags (🇰🇿) are NOT used on
 * purpose: Windows has no regional-indicator glyphs, so Chrome/Edge render them
 * as bare letter pairs ("KZ") — inline SVG looks identical on every OS.
 *
 * Add a locale here when adding one (see §10). Keep them simple — at ~18px the
 * fine detail (the Kazakh eagle, Russia's exact stripe ratios) is invisible, so
 * a clean, recognizable shape beats a faithful-but-muddy one.
 */
function flag(locale: Locale) {
  switch (locale) {
    case "kz":
      // Sky-blue field with a gold sun (rays + disc) and a soaring eagle. The
      // rays and eagle are what tell it apart from Palau (a plain off-centre
      // disc) — dropping them made it read as the wrong flag.
      return (
        <>
          <rect width="20" height="14" fill="#00AFCA" />
          <g stroke="#FEC50C" strokeWidth="0.7" strokeLinecap="round">
            <line x1="6.4" y1="6" x2="13.6" y2="6" />
            <line x1="10" y1="2.4" x2="10" y2="9.6" />
            <line x1="7.45" y1="3.45" x2="12.55" y2="8.55" />
            <line x1="12.55" y1="3.45" x2="7.45" y2="8.55" />
          </g>
          <circle cx="10" cy="6" r="1.9" fill="#FEC50C" />
          <path
            d="M5.6 11.4 Q8 9.9 10 10.7 Q12 9.9 14.4 11.4"
            fill="none"
            stroke="#FEC50C"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
        </>
      );
    case "ru":
    default:
      // White / blue / red horizontal thirds.
      return (
        <>
          <rect width="20" height="14" fill="#fff" />
          <rect y="4.67" width="20" height="4.67" fill="#0039A6" />
          <rect y="9.33" width="20" height="4.67" fill="#D52B1E" />
        </>
      );
  }
}

export function FlagIcon({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 14"
      className={className}
      aria-hidden="true"
      // Rounded corners + a hairline keep a white flag (Russia) from bleeding
      // into a white menu.
      style={{ borderRadius: 2 }}
    >
      {flag(locale)}
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="13"
        rx="1.5"
        fill="none"
        stroke="rgba(0,0,0,0.12)"
      />
    </svg>
  );
}
