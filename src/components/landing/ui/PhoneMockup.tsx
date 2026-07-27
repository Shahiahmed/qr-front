"use client";

import Image from "next/image";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

type PhoneMockupProps = {
  className?: string;
  animated?: boolean;
};

/**
 * Hero phone: real device frame from `/public/mockup.png` (transparent screen)
 * with the sample menu painted behind it.
 *
 * Screen hole in the PNG (measured): sides ≈6%, top/bottom ≈1.05%. The old
 * 8.25% top left a transparent band above the cover — looked like an empty
 * black status strip.
 */
export function PhoneMockup({ className = "", animated = true }: PhoneMockupProps) {
  const copy = useLandingCopy();

  return (
    <div
      className={`relative w-[260px] sm:w-[300px] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-[-30px] bg-[radial-gradient(circle_at_60%_40%,#FFE7DF,transparent_70%)] blur-[10px]" />

      <div className={`relative ${animated ? "animate-floaty" : ""}`}>
        {/* Fills the transparent cutout; large radius matches the PNG glass. */}
        <div
          className="absolute flex flex-col overflow-hidden bg-white isolate"
          style={{
            top: "1.05%",
            right: "5.97%",
            bottom: "1.05%",
            left: "5.97%",
            // Continuous-corner radius of the screen hole in mockup.png
            borderRadius: "14% / 7%",
          }}
        >
          <div className="relative flex min-h-0 flex-[0_0_36%] items-end overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=480&q=72&auto=format&fit=crop"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
            />
            <div className="relative z-[1] p-3.5">
              <div className="text-[18px] font-extrabold leading-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)] sm:text-[20px]">
                {copy.restName}
              </div>
              <div className="text-[11px] text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
                {copy.restTag}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-1.5 overflow-hidden px-3 pb-1 pt-2.5">
            {copy.cats.map((cat) => (
              <span
                key={cat.name}
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  cat.active
                    ? "bg-accent text-white"
                    : "bg-[#F4F0EC] font-semibold text-muted"
                }`}
              >
                {cat.name}
              </span>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-1.5 px-3 pb-3 pt-1">
            {copy.heroDishes.map((dish) => (
              <div
                key={dish.name}
                className="flex min-h-0 flex-1 items-center gap-2.5 rounded-xl border border-border px-2 py-1.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dish.image}
                  alt=""
                  className="h-[42px] w-[42px] shrink-0 rounded-lg object-cover sm:h-[46px] sm:w-[46px]"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold sm:text-[13px]">
                    {dish.name}
                  </div>
                  <div className="truncate text-[10px] text-[#9A938C] sm:text-[11px]">
                    {dish.desc}
                  </div>
                </div>
                <div className="whitespace-nowrap text-[12px] font-extrabold text-accent-hover sm:text-[13px]">
                  {dish.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Image
          src="/mockup.png"
          alt=""
          width={1339}
          height={2716}
          priority
          className="relative z-10 h-auto w-full select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
