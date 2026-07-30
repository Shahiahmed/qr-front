"use client";

import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

export function Faq() {
  const copy = useLandingCopy();

  // FAQPage structured data: tells Google and AI search engines (Perplexity,
  // AI Overviews, ChatGPT Search) these are Q&A pairs, so they can quote the
  // answers directly instead of inferring structure from markup. Built from the
  // same copy the section renders, so it always matches the visible text and is
  // localised per page (/ru vs /kz). Deterministic → no hydration mismatch.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-surface py-20 lg:py-24"
    >
      <script
        type="application/ld+json"
        // Google reads JSON-LD anywhere in the document; the section is a
        // natural home for it and keeps schema next to the content it describes.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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
