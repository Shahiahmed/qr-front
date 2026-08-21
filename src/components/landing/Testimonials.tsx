"use client";

import { Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

export function Testimonials() {
  const copy = useLandingCopy();

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <SectionHeading
          kicker={copy.reviewsKicker}
          title={copy.reviewsTitle}
          subtitle={copy.reviewsSub}
          titleId="reviews-title"
        />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {copy.reviewItems.map((review, index) => (
            <Reveal as="li" key={review.name + review.role} delay={index * 60}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 sm:p-7">
                <Quote
                  size={26}
                  aria-hidden="true"
                  className="mb-4 shrink-0 text-accent-soft"
                  fill="currentColor"
                />

                <blockquote className="flex-1 text-[15px] leading-relaxed text-foreground">
                  {review.quote}
                </blockquote>

                <div
                  className="mt-5 flex gap-0.5 text-accent"
                  aria-hidden="true"
                >
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star key={star} size={15} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>

                <figcaption className="mt-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-hover">
                    {review.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-ink">
                      {review.name}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {review.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
