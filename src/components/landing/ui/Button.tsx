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

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(180deg,#ff7a5c,#ff6a4d)] text-white shadow-[0_10px_24px_-10px_rgba(255,106,77,0.75)] hover:bg-[linear-gradient(180deg,#ff6a4d,#ee5233)] hover:shadow-[0_16px_32px_-12px_rgba(255,106,77,0.85)]",
  secondary:
    "border-[1.5px] border-border-strong bg-white text-foreground hover:border-foreground hover:bg-surface",
  ghost: "bg-transparent text-foreground hover:bg-surface-2",
  onAccent:
    "bg-white text-accent-hover shadow-[0_14px_30px_-10px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]",
  dark: "bg-[linear-gradient(180deg,#ff7a5c,#ff6a4d)] text-white shadow-[0_10px_24px_-10px_rgba(255,106,77,0.6)] hover:bg-[linear-gradient(180deg,#ff6a4d,#ee5233)]",
};

const baseClasses =
  "group/btn inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-[15px] font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

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
