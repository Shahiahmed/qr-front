import { brand } from "@/content/landing";

type LogoProps = {
  className?: string;
  size?: "sm" | "md";
  /** Defaults to the in-page anchor used across the landing. */
  href?: string;
  /** Badge only, no wordmark — for a collapsed sidebar rail. */
  markOnly?: boolean;
};

/**
 * The mark: a simplified QR silhouette drawn in white on the gradient badge —
 * three finder patterns plus a scatter of data modules. Not a scannable code,
 * just enough to read as "QR" at a glance. Inline SVG so it stays crisp at any
 * density and needs no raster asset. `currentColor` lets the modules inherit the
 * badge's white text color.
 */
function QrMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      {/* Top-left finder pattern (ring + center), built from bars so the gaps
          fall through to the gradient behind. */}
      <rect x="6" y="6" width="40" height="8" />
      <rect x="6" y="38" width="40" height="8" />
      <rect x="6" y="14" width="8" height="24" />
      <rect x="38" y="14" width="8" height="24" />
      <rect x="22" y="22" width="8" height="8" />
      {/* Top-right finder pattern. */}
      <rect x="54" y="6" width="40" height="8" />
      <rect x="54" y="38" width="40" height="8" />
      <rect x="54" y="14" width="8" height="24" />
      <rect x="86" y="14" width="8" height="24" />
      <rect x="70" y="22" width="8" height="8" />
      {/* Bottom-left finder pattern. */}
      <rect x="6" y="54" width="40" height="8" />
      <rect x="6" y="86" width="40" height="8" />
      <rect x="6" y="62" width="8" height="24" />
      <rect x="38" y="62" width="8" height="24" />
      <rect x="22" y="70" width="8" height="8" />
      {/* Data modules — scattered in the free quadrant and along the seams. */}
      <rect x="62" y="46" width="8" height="8" />
      <rect x="78" y="46" width="8" height="8" />
      <rect x="46" y="62" width="8" height="8" />
      <rect x="46" y="78" width="8" height="8" />
      <rect x="54" y="54" width="8" height="8" />
      <rect x="62" y="54" width="8" height="8" />
      <rect x="78" y="54" width="8" height="8" />
      <rect x="54" y="62" width="8" height="8" />
      <rect x="70" y="62" width="8" height="8" />
      <rect x="86" y="62" width="8" height="8" />
      <rect x="62" y="70" width="8" height="8" />
      <rect x="78" y="70" width="8" height="8" />
      <rect x="86" y="70" width="8" height="8" />
      <rect x="54" y="78" width="8" height="8" />
      <rect x="70" y="78" width="8" height="8" />
      <rect x="70" y="86" width="8" height="8" />
      <rect x="78" y="86" width="8" height="8" />
      <rect x="86" y="86" width="8" height="8" />
    </svg>
  );
}

export function Logo({ className = "", size = "md", href = "#hero", markOnly = false }: LogoProps) {
  // The md mark steps down on narrow phones so the header row stays on one line.
  const markSize =
    size === "sm"
      ? "h-[34px] w-[34px] rounded-[11px]"
      : "h-[34px] w-[34px] rounded-[11px] sm:h-[38px] sm:w-[38px] sm:rounded-xl";
  const textSize = size === "sm" ? "text-lg" : "text-lg sm:text-xl";

  return (
    <a
      href={href}
      className={`group/logo inline-flex shrink-0 items-center gap-2 text-foreground no-underline sm:gap-2.5 ${className}`}
      aria-label={`${brand.name} — на главную`}
    >
      <span
        className={`flex items-center justify-center bg-[linear-gradient(140deg,#ff8a70,#ff6a4d_55%,#f0a83c)] text-white shadow-[0_6px_16px_-4px_rgba(255,106,77,0.55)] transition-transform duration-200 group-hover/logo:scale-105 ${markSize}`}
      >
        <QrMark className="h-[62%] w-[62%]" />
      </span>
      {markOnly ? null : (
        <span className={`font-extrabold tracking-[-0.02em] ${textSize}`}>
          {/* Badge is now a QR glyph, not the letters "QR" — so the wordmark
              beside it carries the full name to read as "QR меню". */}
          {brand.name}
        </span>
      )}
    </a>
  );
}
