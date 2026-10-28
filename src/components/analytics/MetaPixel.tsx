"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

/**
 * Meta (Facebook/Instagram) Pixel the marketing team runs ads with (handed over
 * 2026-10-28). Not a secret — the ID ships in the page source of every site
 * that uses the pixel.
 */
export const META_PIXEL_ID = "543088086372819";

type Fbq = (...args: unknown[]) => void;

/**
 * Meta Pixel, mounted from the `[locale]` root layout next to `GoogleTag` and
 * for the same reasons left off `/m/{slug}`: diners at a table are not the
 * audience the ads are for.
 *
 * The base code fires one PageView on load. App Router navigations don't
 * reload the page, so later route changes send their own PageView — otherwise
 * a visitor who clicks from the landing into registration counts as one view.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const firstView = useRef(true);

  useEffect(() => {
    // The first PageView comes from the base code below.
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    const fbq = (window as { fbq?: Fbq }).fbq;
    fbq?.("track", "PageView");
  }, [pathname]);

  // NODE_ENV is inlined at build time, so this drops out of dev bundles —
  // local reloads would otherwise land in the live ad account.
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {/* Meta's base code, unchanged apart from the ID constant. */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
