"use client";

import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

export function Demo() {
  const copy = useLandingCopy();

  return (
    <section
      id="demo"
      aria-labelledby="demo-title"
      className="relative overflow-hidden bg-ink py-20 text-white lg:py-24"
    >
      <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-[60px] -top-20 h-[400px] w-[400px] bg-[radial-gradient(circle,rgba(255,106,77,0.32),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-[360px] w-[360px] bg-[radial-gradient(circle,rgba(240,168,60,0.18),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1180px] px-4 sm:px-6">
        <SectionHeading
          kicker={copy.demoKicker}
          title={copy.demoTitle}
          subtitle={copy.demoSub}
          titleId="demo-title"
          light
        />

        <div className="flex flex-wrap items-end justify-center gap-7">
          <Reveal delay={0}>
            <MenuPhone />
          </Reveal>
          <Reveal delay={110}>
            <DetailPhone />
          </Reveal>
          <Reveal delay={220}>
            <CartPhone />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MenuPhone() {
  const copy = useLandingCopy();

  return (
    <div
      className="w-[270px] rounded-[42px] bg-[#232019] p-2.5 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)]"
      aria-hidden="true"
    >
      <div className="overflow-hidden rounded-[33px] bg-white text-foreground">
        <div className="placeholder-stripes flex h-24 items-end p-3.5">
          <div className="text-[17px] font-extrabold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)]">
            {copy.restName}
          </div>
        </div>
        <div className="flex gap-1.5 px-3 pb-1 pt-3">
          {copy.cats.map((cat) => (
            <span
              key={cat.name}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${
                cat.active
                  ? "bg-accent text-white"
                  : "bg-[#F4F0EC] font-semibold text-muted"
              }`}
            >
              {cat.name}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 px-3 pb-3.5 pt-1.5">
          {copy.heroDishes.slice(0, 3).map((dish) => (
            <div
              key={dish.name}
              className="flex items-center gap-2.5 rounded-[13px] border border-border p-2"
            >
              <div className="placeholder-stripes-sm h-11 w-11 shrink-0 rounded-[10px]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold">{dish.name}</div>
                <div className="text-[11px] font-bold text-accent-hover">
                  {dish.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailPhone() {
  const copy = useLandingCopy();

  return (
    <div
      className="mb-7 w-[270px] rounded-[42px] bg-[#232019] p-2.5 shadow-[0_40px_70px_-25px_rgba(0,0,0,0.8)]"
      aria-hidden="true"
    >
      <div className="overflow-hidden rounded-[33px] bg-white text-foreground">
        <div className="placeholder-stripes relative h-[170px]">
          <span className="absolute left-3 top-3 rounded-md bg-white/65 px-1.5 py-0.5 font-mono text-[10px] text-[#C67A66]">
            фото блюда
          </span>
        </div>
        <div className="p-4">
          <div className="text-[19px] font-extrabold tracking-[-0.01em]">
            {copy.detailName}
          </div>
          <div className="mb-3.5 mt-1.5 text-[13px] leading-snug text-muted-soft">
            {copy.detailDesc}
          </div>
          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-xl font-extrabold">{copy.detailPrice}</span>
            <div className="flex items-center gap-3 rounded-full border border-[#ECE7E2] px-3 py-1.5">
              <span className="font-extrabold text-accent-hover">−</span>
              <span className="font-bold">1</span>
              <span className="font-extrabold text-accent-hover">+</span>
            </div>
          </div>
          <div className="rounded-[14px] bg-accent py-3 text-center text-[15px] font-bold text-white">
            {copy.detailAdd}
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPhone() {
  const copy = useLandingCopy();

  return (
    <div
      className="w-[270px] rounded-[42px] bg-[#232019] p-2.5 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)]"
      aria-hidden="true"
    >
      <div className="overflow-hidden rounded-[33px] bg-white text-foreground">
        <div className="flex items-center justify-between border-b border-border px-3.5 pb-2.5 pt-4">
          <span className="text-[17px] font-extrabold">{copy.cartTitle}</span>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent-hover">
            {copy.cartTable}
          </span>
        </div>
        <div className="flex flex-col gap-2.5 px-3.5 py-2.5">
          {copy.cartItems.map((item) => (
            <div key={item.name} className="flex items-center gap-2.5">
              <div className="placeholder-stripes-sm h-10 w-10 shrink-0 rounded-[10px]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold">{item.name}</div>
                <div className="text-[11px] text-[#9A938C]">× {item.qty}</div>
              </div>
              <div className="text-xs font-bold">{item.price}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-3.5 py-3">
          <div className="mb-3 flex justify-between">
            <span className="text-[13px] text-muted-soft">{copy.cartTotalLabel}</span>
            <span className="text-[17px] font-extrabold">{copy.cartTotal}</span>
          </div>
          <div className="rounded-[14px] bg-accent py-3 text-center text-[15px] font-bold text-white">
            {copy.cartCheckout}
          </div>
          <div className="mt-2.5 text-center text-xs text-[#9A938C]">
            {copy.cartCall}
          </div>
        </div>
      </div>
    </div>
  );
}
