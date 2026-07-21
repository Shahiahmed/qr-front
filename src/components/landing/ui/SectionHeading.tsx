import { Reveal } from "@/components/landing/ui/Reveal";

type SectionHeadingProps = {
  kicker: string;
  title: string;
  subtitle?: string;
  titleId: string;
  light?: boolean;
};

export function SectionHeading({
  kicker,
  title,
  subtitle,
  titleId,
  light = false,
}: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto mb-[52px] max-w-[580px] text-center">
      <div
        className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-bold uppercase tracking-[0.14em] ${
          light
            ? "bg-white/10 text-[#FF9B84]"
            : "bg-accent-soft text-accent-hover"
        }`}
      >
        {kicker}
      </div>
      <h2
        id={titleId}
        className={`text-balance text-[32px] font-bold tracking-[-0.035em] sm:text-[40px] ${
          light ? "text-white" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-3.5 text-pretty text-lg leading-relaxed ${
            light ? "text-[#B8B0A9]" : "text-muted"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
