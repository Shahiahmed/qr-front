import Script from "next/script";

/**
 * Google Ads account the marketing team runs campaigns under. Not a secret —
 * an `AW-` tag ships in the page source of every site that advertises.
 */
export const GOOGLE_ADS_ID = "AW-729626448";

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

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      {/* Inline scripts need a stable `id` for Next to track and dedupe them
          across client-side navigation (docs .../02-guides/scripts.md). */}
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
