"use client";

import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

type PhoneMockupProps = {
  className?: string;
  animated?: boolean;
};

export function PhoneMockup({ className = "", animated = true }: PhoneMockupProps) {
  const copy = useLandingCopy();

  return (
    <div
      className={`relative w-[280px] sm:w-[320px] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-[-30px] bg-[radial-gradient(circle_at_60%_40%,#FFE7DF,transparent_70%)] blur-[10px]" />
      <div
        className={`relative rounded-[46px] bg-[linear-gradient(160deg,#3a332c,#141210_35%)] p-3 shadow-[0_40px_80px_-30px_rgba(20,18,16,0.6),0_0_0_1px_rgba(255,255,255,0.06)_inset] ${
          animated ? "animate-floaty" : ""
        }`}
      >
        {/* Camera notch. */}
        <div className="absolute left-1/2 top-[18px] z-10 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-[#141210]" />
        <div className="relative overflow-hidden rounded-[36px] bg-white">
          <div className="placeholder-stripes relative flex h-[150px] items-end p-4">
            <span className="absolute left-4 top-3 rounded-md bg-white/60 px-1.5 py-0.5 font-mono text-[10px] text-[#C67A66]">
              обложка
            </span>
            <div>
              <div className="text-[22px] font-extrabold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)]">
                {copy.restName}
              </div>
              <div className="text-xs text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
                {copy.restTag}
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-hidden px-3.5 pb-1.5 pt-3.5">
            {copy.cats.map((cat) => (
              <span
                key={cat.name}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
                  cat.active
                    ? "bg-accent text-white"
                    : "bg-[#F4F0EC] font-semibold text-muted"
                }`}
              >
                {cat.name}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 px-3.5 pb-[18px] pt-2">
            {copy.heroDishes.map((dish) => (
              <div
                key={dish.name}
                className="flex items-center gap-3 rounded-2xl border border-border p-2.5"
              >
                <div className="placeholder-stripes-sm h-[58px] w-[58px] shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{dish.name}</div>
                  <div className="truncate text-xs text-[#9A938C]">{dish.desc}</div>
                </div>
                <div className="whitespace-nowrap text-sm font-extrabold text-accent-hover">
                  {dish.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
