import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "onAccent" | "dark";

type CommonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

// Fill, hover fill and shadow come from CSS vars (globals.css :root) — currently
// flat terracotta with no shadow.
const filled =
  "bg-[linear-gradient(180deg,var(--btn-from),var(--btn-to))] text-white shadow-[var(--btn-shadow)] hover:bg-[linear-gradient(180deg,var(--btn-hover-from),var(--btn-hover-to))] hover:shadow-[var(--btn-shadow-hover)]";

const variantClasses: Record<Variant, string> = {
  primary: filled,
  secondary:
    "border-[1.5px] border-border-strong bg-white text-foreground hover:border-foreground hover:bg-surface",
  ghost: "bg-transparent text-foreground hover:bg-surface-2",
  onAccent:
    "bg-white text-accent-hover hover:bg-accent-soft",
  dark: filled,
};

// Hover lift is deliberately 1px, not the usual 2: buttons sit everywhere on the
// landing, so anything larger reads as the page twitching under the cursor.
const baseClasses =
  "group/btn inline-flex items-center justify-center gap-2 rounded-[var(--btn-radius)] font-bold transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50";

/**
 * Default padding and text size, each dropped when `className` sets its own
 * (unprefixed) value. Without this both classes land in the list and the
 * stylesheet order — not the caller — decides which wins, so `py-2` silently
 * loses to the default `py-3`. Responsive overrides (`sm:px-7`) keep the default.
 */
function sizeDefaults(className: string): string {
  const has = (re: RegExp) => re.test(className);
  return [
    has(/(^|\s)px?-/) ? "" : "px-5",
    has(/(^|\s)py?-/) ? "" : "py-3",
    has(/(^|\s)text-(\[\d|xs|sm|base|lg|xl|\dxl)/) ? "" : "text-[15px]",
  ].join(" ");
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${sizeDefaults(className)} ${variantClasses[variant]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <a href={href} className={classes} {...linkProps}>
        {children}
      </a>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button type={buttonProps.type ?? "button"} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
