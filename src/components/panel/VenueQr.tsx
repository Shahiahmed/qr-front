"use client";

import { Copy, Download, Printer } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { menuByLocale } from "@/content/menu";
import { useVenues } from "@/lib/venues";

/**
 * Options shared by every rendering, so the downloaded file and the printed
 * tent carry the same code.
 *
 * Error correction `M` recovers ~15% of a damaged code — the right trade for
 * something that will sit on a restaurant table collecting fingerprints and
 * splashes. `H` would survive more but pack the modules tighter, which costs
 * more than it gains at this size.
 */
const QR_OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 1,
  color: { dark: "#141210", light: "#ffffff" },
};

export function VenueQr({
  locale,
  establishmentId,
}: {
  locale: Locale;
  establishmentId: number;
}) {
  const copy = authByLocale[locale];
  const menuCopy = menuByLocale[locale];
  const { data: venues, isPending } = useVenues();

  const venue = venues?.find((item) => item.id === establishmentId);

  const [svg, setSvg] = useState<string | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /*
   * Built from the live origin rather than a constant: on a preview deploy or
   * a custom domain the printed code has to point at the host the owner is
   * actually looking at, or every printed tent leads nowhere.
   */
  const menuUrl = venue
    ? `${typeof window === "undefined" ? "" : window.location.origin}/m/${venue.slug}`
    : "";

  useEffect(() => {
    if (!menuUrl) return;

    let cancelled = false;

    Promise.all([
      QRCode.toString(menuUrl, { ...QR_OPTIONS, type: "svg", width: 512 }),
      // 1024px so a printed code stays crisp at table-tent size.
      QRCode.toDataURL(menuUrl, { ...QR_OPTIONS, width: 1024 }),
    ]).then(([svgText, dataUrl]) => {
      if (cancelled) return;
      setSvg(svgText);
      setPngUrl(dataUrl);
    });

    return () => {
      cancelled = true;
    };
  }, [menuUrl]);

  if (isPending) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-surface-2" />;
  }

  if (!venue) {
    return (
      <p className="rounded-[20px] border border-border bg-white p-6 text-muted">
        404
      </p>
    );
  }

  function download(href: string, extension: string) {
    const link = document.createElement("a");
    link.href = href;
    link.download = `qmenu-${venue!.slug}.${extension}`;
    link.click();
  }

  return (
    <>
      {/* On screen: the controls. Hidden when printing. */}
      <div className="print:hidden">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/dashboard`}
            className="text-[15px] font-semibold text-muted transition-colors hover:text-foreground"
          >
            ← {menuCopy.backToVenues}
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[20px] border border-border bg-white p-5 text-center">
            {svg ? (
              <div
                className="mx-auto aspect-square w-full max-w-[260px] [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <div className="mx-auto aspect-square w-full max-w-[260px] animate-pulse rounded-xl bg-surface-2" />
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-white p-5">
            <div>
              <h2 className="text-[19px] font-extrabold tracking-[-0.02em]">
                {venue.name}
              </h2>
              <p className="mt-1 text-[15px] text-muted">{copy.qrSubtitle}</p>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-semibold">{copy.qrLinkLabel}</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
                  {menuUrl}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(menuUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-strong px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  <Copy size={15} />
                  {copied ? copy.qrCopied : copy.qrCopy}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="secondary"
                onClick={() => pngUrl && download(pngUrl, "png")}
                className="py-2.5 text-[15px]"
              >
                <Download size={16} />
                {copy.qrDownloadPng}
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  if (!svg) return;
                  const blob = new Blob([svg], { type: "image/svg+xml" });
                  const url = URL.createObjectURL(blob);
                  download(url, "svg");
                  URL.revokeObjectURL(url);
                }}
                className="py-2.5 text-[15px]"
              >
                <Download size={16} />
                {copy.qrDownloadSvg}
              </Button>

              <Button
                variant="primary"
                onClick={() => window.print()}
                className="py-2.5 text-[15px]"
              >
                <Printer size={16} />
                {copy.qrPrint}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/*
        The table tent. Off-screen normally, and the only thing on the page
        when printing — see the `print:` rules in globals.css.
      */}
      <div className="hidden print:block">
        <div className="mx-auto flex max-w-[420px] flex-col items-center gap-6 py-10 text-center">
          <p className="text-[34px] font-extrabold tracking-[-0.03em]">
            {copy.tentHeading}
          </p>

          {svg ? (
            <div
              className="w-[300px] [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : null}

          <div>
            <p className="text-[19px] font-bold">{venue.name}</p>
            <p className="mt-1 text-[15px]">{copy.tentHint}</p>
          </div>

          <p className="text-sm">{menuUrl}</p>
        </div>
      </div>
    </>
  );
}
