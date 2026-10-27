import type { ReactNode } from "react";

/**
 * The one page title of every cabinet screen. Same size and the same gap to the
 * content everywhere, so switching tabs doesn't make the page jump. `actions`
 * sit on the right (wrapping under the title on phones).
 */
export function PanelPageHeader({
  title,
  subtitle,
  kicker,
  actions,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small uppercase label above the title (overview only). */
  kicker?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 sm:mb-8 ${className}`}>
      <div className="min-w-0">
        {kicker ? (
          <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-muted-soft">
            {kicker}
          </p>
        ) : null}
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[30px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-[640px] text-[15px] text-muted">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
