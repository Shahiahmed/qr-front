import Script from "next/script";

/**
 * Google Ads accounts the marketing team runs campaigns under. Not a secret —
 * an `AW-` tag ships in the page source of every site that advertises.
 *
 * Two IDs because marketing handed over a second account (2026-09-15) while the
 * first may still have live campaigns. One gtag.js loader serves both — each
 * account just needs its own `config` call. Drop the old one once marketing
 * confirms nothing runs on it.
 */
export const GOOGLE_ADS_IDS = ["AW-729626448", "AW-18453331524"] as const;

/**
 * Google Ads tag (gtag.js), mounted from the `[locale]` root layout so it
 * covers the landing (where ads point) and the cabinet behind it.
 *
 * Deliberately NOT mounted on `/m/{slug}`: those are diners scanning a QR at a
 * table, not people who could ever buy the product. Tracking them would pad
 * remarketing lists with the wrong audience and slow the one screen that has to
 * open fast on restaurant wifi.
 */
export function GoogleTag() {
  // NODE_ENV is inlined at build time, so this drops out of dev bundles
  // entirely — local reloads would otherwise land in the live Ads account.
  if (process.env.NODE_ENV !== "production") return null;

  const configs = GOOGLE_ADS_IDS.map((id) => `gtag('config', '${id}');`).join(
    "\n",
  );

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_IDS[0]}`}
        strategy="afterInteractive"
      />
      {/* Inline scripts need a stable `id` for Next to track and dedupe them
          across client-side navigation (docs .../02-guides/scripts.md). */}
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${configs}`}
      </Script>
    </>
  );
}
