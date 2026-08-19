import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { googleAuthUrl, isApiConfigured } from "@/lib/api";

/**
 * "Continue with Google" — a plain anchor, because OAuth navigates the whole
 * browser to Google and back (it cannot run over `fetch`). Rendered above the
 * email/password form on the login and register screens, with an "or" divider.
 */
export function GoogleButton({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];

  // No API configured (e.g. a preview build) → nothing to sign in against.
  if (!isApiConfigured) return null;

  return (
    <div className="mb-5">
      <a
        href={googleAuthUrl(locale)}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-surface"
      >
        <GoogleGlyph />
        {copy.continueWithGoogle}
      </a>

      <div className="mt-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-soft uppercase">
          {copy.orDivider}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

/** Google's four-colour "G". Inline so it needs no external asset (CSP). */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
