"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";
import { WHATSAPP_NUMBER } from "@/content/landing";

export function Faq() {
  const copy = useLandingCopy();
  // Accordion: only one answer open at a time; the first starts open so the
  // section shows an answer, not just a wall of questions.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
      className="bg-surface py-16 lg:py-[104px]"
    >
      <script
        type="application/ld+json"
        // Google reads JSON-LD anywhere in the document; the section is a
        // natural home for it and keeps schema next to the content it describes.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto grid max-w-[1200px] gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        {/* Left: heading + a way out when the answer isn't listed. */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            kicker={copy.faqKicker}
            title={copy.faqTitle}
            subtitle={copy.faqSub}
            titleId="faq-title"
            align="left"
          />
          <p className="-mt-2 text-[15px] text-muted">
            {copy.faqMore}{" "}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 font-bold text-accent-hover underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <MessageCircle size={16} aria-hidden="true" />
              {copy.faqMoreLink}
            </a>
          </p>
        </div>

        <Reveal>
          <div className="flex flex-col gap-3">
            {copy.faqItems.map((item, index) => (
              <details
                key={item.q}
                open={openIndex === index}
                className="group rounded-[14px] border border-border bg-white px-5 transition-colors open:border-border-strong"
              >
                <summary
                  className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden"
                  onClick={(event) => {
                    // Own the toggle so opening one closes the rest.
                    event.preventDefault();
                    setOpenIndex((current) =>
                      current === index ? null : index,
                    );
                  }}
                >
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
