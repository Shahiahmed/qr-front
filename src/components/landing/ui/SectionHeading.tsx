import { Reveal } from "@/components/landing/ui/Reveal";

type SectionHeadingProps = {
  kicker: string;
  title: string;
  subtitle?: string;
  titleId: string;
  light?: boolean;
  /** `left` for split layouts (FAQ) where the heading sits in its own column. */
  align?: "center" | "left";
};

export function SectionHeading({
  kicker,
  title,
  subtitle,
  titleId,
  light = false,
  align = "center",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <Reveal
      className={centered ? "mx-auto mb-12 max-w-[640px] text-center lg:mb-14" : "mb-8 max-w-[520px]"}
    >
      {/* Plain uppercase kicker — no pill behind it. */}
      <p
        className={`mb-3 text-sm font-bold uppercase tracking-[0.08em] ${
          light ? "text-[var(--on-dark-accent)]" : "text-accent-hover"
        }`}
      >
        {kicker}
      </p>
      <h2
        id={titleId}
        className={`text-balance text-[clamp(30px,5.2vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em] ${
          light ? "text-white" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-4 text-pretty text-lg leading-relaxed ${
            light ? "text-[var(--on-dark-muted)]" : "text-muted"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
