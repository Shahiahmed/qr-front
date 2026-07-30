"use client";

import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

export function Faq() {
  const copy = useLandingCopy();

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-surface py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[820px] px-4 sm:px-6">
        <SectionHeading
          kicker={copy.faqKicker}
          title={copy.faqTitle}
          subtitle={copy.faqSub}
          titleId="faq-title"
        />

        <Reveal>
          <div className="flex flex-col gap-3">
            {copy.faqItems.map((item) => (
              // Native <details>: accessible and works without JS, so it stays
              // correct on the force-static landing.
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-white px-5 transition-colors open:border-border-strong"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-bold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    size={18}
                    aria-hidden
                    className="shrink-0 text-muted transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="pb-4 text-[15px] leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
