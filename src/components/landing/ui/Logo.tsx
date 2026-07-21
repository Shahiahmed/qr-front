import { brand } from "@/content/landing";

type LogoProps = {
  className?: string;
  size?: "sm" | "md";
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  // The md mark steps down on narrow phones so the header row stays on one line.
  const markSize =
    size === "sm"
      ? "h-[34px] w-[34px] rounded-[11px] text-[17px]"
      : "h-[34px] w-[34px] rounded-[11px] text-[17px] sm:h-[38px] sm:w-[38px] sm:rounded-xl sm:text-[19px]";
  const textSize = size === "sm" ? "text-lg" : "text-lg sm:text-xl";

  return (
    <a
      href="#hero"
      className={`group/logo inline-flex shrink-0 items-center gap-2 text-foreground no-underline sm:gap-2.5 ${className}`}
      aria-label={`${brand.name} — на главную`}
    >
      <span
        className={`flex items-center justify-center bg-[linear-gradient(140deg,#ff8a70,#ff6a4d_55%,#f0a83c)] font-extrabold text-white shadow-[0_6px_16px_-4px_rgba(255,106,77,0.55)] transition-transform duration-200 group-hover/logo:scale-105 ${markSize}`}
        aria-hidden="true"
      >
        {brand.logoLetter}
      </span>
      <span className={`font-extrabold tracking-[-0.02em] ${textSize}`}>
        {brand.name}
      </span>
    </a>
  );
}
