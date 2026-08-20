type PreloaderProps = {
  /** Cover the whole viewport (route-level loading) instead of filling the parent. */
  fullscreen?: boolean;
  /** Optional caption under the spinner. Pass a localized string; omitted by default. */
  label?: string;
  className?: string;
};

/**
 * Minimal centered loading spinner — an accent ring on a tinted track. No logo,
 * no branding, just a clean rotating arc. Locale-agnostic, so it drops into any
 * loading state (the cabinet shell, the guest menu route, anywhere).
 * `prefers-reduced-motion` freezes the spin (see globals.css motion-reduce rule).
 */
export function Preloader({ fullscreen = false, label, className = "" }: PreloaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${
        fullscreen ? "fixed inset-0 z-[100] bg-surface" : "min-h-[240px] w-full"
      } ${className}`}
    >
      <span className="h-11 w-11 animate-spin rounded-full border-[3px] border-accent-tint border-t-accent motion-reduce:animate-none" />
      {label ? <p className="text-sm font-semibold text-muted">{label}</p> : null}
      <span className="sr-only">{label ?? "Loading…"}</span>
    </div>
  );
}
