"use client";

import { Copy, Download, ImagePlus, QrCode, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { menuByLocale } from "@/content/menu";
import {
  DEFAULT_QR_STYLE,
  optionLabel,
  QR_COLOR_PRESETS,
  QR_CORNER_STYLES,
  QR_DOT_STYLES,
  type QrCornerStyle,
  type QrDotStyle,
} from "@/content/qr";
import { useVenues } from "@/lib/venues";

// Rendered large so a downloaded/printed code stays crisp; the preview is
// scaled down with CSS. Logo pushes error correction to H — the extra
// redundancy is what lets the code survive a picture punched into its middle.
const CANVAS_SIZE = 1000;

type LogoKind = "none" | "venue" | "custom";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      resolve(image);
      URL.revokeObjectURL(url);
    };
    image.onerror = reject;
    image.src = url;
  });
}

function saveUrl(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
}

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

  const [dotStyle, setDotStyle] = useState<QrDotStyle>(DEFAULT_QR_STYLE.dotStyle);
  const [cornerStyle, setCornerStyle] = useState<QrCornerStyle>(
    DEFAULT_QR_STYLE.cornerStyle,
  );
  const [dotColor, setDotColor] = useState(DEFAULT_QR_STYLE.dotColor);
  const [bgColor, setBgColor] = useState(DEFAULT_QR_STYLE.bgColor);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoKind, setLogoKind] = useState<LogoKind>("none");
  const [logoError, setLogoError] = useState(false);

  // Editable table-tent text. Defaults are locale copy — deterministic from the
  // `locale` prop, so server and first client render agree (no hydration flip).
  const [heading, setHeading] = useState(copy.tentHeading);
  const [caption, setCaption] = useState(copy.tentHint);
  const [showName, setShowName] = useState(true);
  const [showUrl, setShowUrl] = useState(true);

  const [copied, setCopied] = useState(false);
  const [pngUrl, setPngUrl] = useState<string | null>(null);

  // Host for the generated canvas. Kept offscreen: the visible preview is the
  // rasterised poster below, which is exactly what downloads/prints.
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<{
    append: (el: HTMLElement) => void;
    update: (options: Record<string, unknown>) => void;
    download: (options: { name: string; extension: string }) => Promise<void>;
    getRawData: (extension: string) => Promise<Blob | null>;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /*
   * Built from the live origin rather than a constant: on a preview deploy or
   * a custom domain the printed code has to point at the host the owner is
   * actually looking at, or every printed tent leads nowhere.
   */
  const menuUrl = venue
    ? `${typeof window === "undefined" ? "" : window.location.origin}/m/${venue.slug}`
    : "";

  const options = useMemo(
    () => ({
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      type: "canvas" as const,
      data: menuUrl,
      margin: 24,
      qrOptions: { errorCorrectionLevel: logo ? "H" : "M" },
      // Empty string (not undefined) reliably clears a previously set logo —
      // the library guards drawing behind `if (options.image)`, and `update`
      // merges rather than replaces, so `undefined` would keep the old image.
      image: logo ?? "",
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 8,
        imageSize: 0.3,
        hideBackgroundDots: true,
        saveAsBlob: true,
      },
      dotsOptions: { type: dotStyle, color: dotColor },
      cornersSquareOptions: { type: cornerStyle, color: dotColor },
      cornersDotOptions: { type: cornerStyle, color: dotColor },
      backgroundOptions: { color: bgColor },
    }),
    [menuUrl, dotStyle, cornerStyle, dotColor, bgColor, logo],
  );

  // Create the instance once, then feed it every option change. Dynamic import
  // keeps the DOM-only library out of the server prerender.
  useEffect(() => {
    if (!menuUrl) return;
    let alive = true;

    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (!alive || !canvasHostRef.current) return;
      if (!qrRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        qrRef.current = new QRCodeStyling(options as any) as any;
        canvasHostRef.current.innerHTML = "";
        qrRef.current!.append(canvasHostRef.current);
      } else {
        qrRef.current.update(options);
      }
    });

    return () => {
      alive = false;
    };
  }, [options, menuUrl]);

  // Rasterise for the visible poster preview and the printed tent — an <img>
  // both renders live and prints reliably where a raw <canvas> can be blank.
  useEffect(() => {
    if (!menuUrl) return;
    let alive = true;
    let url: string | null = null;

    const timer = setTimeout(() => {
      qrRef.current
        ?.getRawData("png")
        .then((blob) => {
          if (!alive || !blob) return;
          url = URL.createObjectURL(blob);
          setPngUrl(url);
        })
        .catch(() => {});
    }, 120);

    return () => {
      alive = false;
      clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
    };
  }, [options, menuUrl]);

  if (isPending) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-surface-2" />;
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[20px] border border-border bg-white px-6 py-14 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <QrCode size={30} strokeWidth={1.75} />
        </span>
        <p className="text-[17px] font-bold">{menuCopy.venueNotFound}</p>
        <Link
          href={`/${locale}/dashboard`}
          className="text-[15px] font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          ← {menuCopy.backToVenues}
        </Link>
      </div>
    );
  }

  async function downloadCodePng() {
    await qrRef.current?.download({ name: `qmenu-${venue!.slug}`, extension: "png" });
  }

  // Composes the finished table tent — heading, code, name, caption, url — onto
  // one canvas and downloads it as a shareable PNG (print-shop ready).
  async function downloadTent() {
    const blob = await qrRef.current?.getRawData("png");
    if (!blob) return;
    const qrImage = await blobToImage(blob);
    if (document.fonts?.ready) await document.fonts.ready;

    const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
    const W = 1080;
    const padX = 90;
    const maxTextW = W - padX * 2;
    const qrSize = 640;
    const ink = "#141210";
    const muted = "#6f6a63";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const headingFont = `800 60px ${family}`;
    const nameFont = `700 40px ${family}`;
    const captionFont = `400 30px ${family}`;
    const urlFont = `500 26px ${family}`;

    const wrap = (text: string, font: string): string[] => {
      ctx.font = font;
      const words = text.trim().split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > maxTextW) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    const headingLines = heading.trim() ? wrap(heading, headingFont) : [];
    const nameLines = showName && venue!.name ? wrap(venue!.name, nameFont) : [];
    const captionLines = caption.trim() ? wrap(caption, captionFont) : [];
    const urlText = showUrl ? menuUrl : "";

    const topPad = 80;
    const botPad = 80;
    const blockGap = 34;
    let height = topPad;
    height += headingLines.length * 74;
    if (headingLines.length) height += blockGap;
    height += qrSize;
    if (nameLines.length) height += blockGap + nameLines.length * 50;
    if (captionLines.length) height += 18 + captionLines.length * 40;
    if (urlText) height += 18 + 34;
    height += botPad;

    canvas.width = W;
    canvas.height = height;

    // Resizing the canvas clears its context — restore drawing state here.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, height);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    let y = topPad;
    ctx.fillStyle = ink;
    ctx.font = headingFont;
    for (const line of headingLines) {
      ctx.fillText(line, W / 2, y);
      y += 74;
    }
    if (headingLines.length) y += blockGap;

    ctx.drawImage(qrImage, (W - qrSize) / 2, y, qrSize, qrSize);
    y += qrSize;

    if (nameLines.length) {
      y += blockGap;
      ctx.fillStyle = ink;
      ctx.font = nameFont;
      for (const line of nameLines) {
        ctx.fillText(line, W / 2, y);
        y += 50;
      }
    }
    if (captionLines.length) {
      y += 18;
      ctx.fillStyle = muted;
      ctx.font = captionFont;
      for (const line of captionLines) {
        ctx.fillText(line, W / 2, y);
        y += 40;
      }
    }
    if (urlText) {
      y += 18;
      ctx.fillStyle = muted;
      ctx.font = urlFont;
      ctx.fillText(urlText, W / 2, y);
    }

    canvas.toBlob((out) => {
      if (!out) return;
      const url = URL.createObjectURL(out);
      saveUrl(url, `qmenu-${venue!.slug}-tent.png`);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  async function useVenueLogo() {
    if (!venue!.logo_url) return;
    setLogoError(false);
    try {
      // Same-origin proxy → the fetched blob is readable and won't taint the
      // canvas on PNG/SVG export (see app/api/venue-logo).
      const response = await fetch(
        `/api/venue-logo?src=${encodeURIComponent(venue!.logo_url)}`,
      );
      if (!response.ok) throw new Error("proxy failed");
      const dataUrl = await blobToDataUrl(await response.blob());
      setLogo(dataUrl);
      setLogoKind("venue");
    } catch {
      setLogoError(true);
    }
  }

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setLogoError(false);
    setLogo(await blobToDataUrl(file));
    setLogoKind("custom");
  }

  function clearLogo() {
    setLogo(null);
    setLogoKind("none");
    setLogoError(false);
  }

  function resetStyle() {
    setDotStyle(DEFAULT_QR_STYLE.dotStyle);
    setCornerStyle(DEFAULT_QR_STYLE.cornerStyle);
    setDotColor(DEFAULT_QR_STYLE.dotColor);
    setBgColor(DEFAULT_QR_STYLE.bgColor);
    setHeading(copy.tentHeading);
    setCaption(copy.tentHint);
    setShowName(true);
    setShowUrl(true);
    clearLogo();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/dashboard`}
            className="text-[15px] font-semibold text-muted transition-colors hover:text-foreground"
          >
            ← {menuCopy.backToVenues}
          </Link>
        </div>

        {/* Offscreen render target for the styling library. */}
        <div ref={canvasHostRef} className="pointer-events-none absolute -left-[9999px] top-0" />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          {/* The finished tent — what the owner gets. */}
          <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-white p-5">
            <div>
              <h2 className="text-[19px] font-extrabold tracking-[-0.02em]">
                {copy.posterTitle}
              </h2>
              <p className="mt-1 text-[15px] text-muted">{copy.qrSubtitle}</p>
            </div>

            {/* WYSIWYG poster — mirrors the printed tent and the PNG download. */}
            <div className="rounded-2xl border border-border bg-surface-2 p-5">
              <div className="mx-auto flex max-w-[320px] flex-col items-center gap-4 text-center">
                {heading.trim() ? (
                  <p className="text-[24px] font-extrabold leading-tight tracking-[-0.02em]">
                    {heading}
                  </p>
                ) : null}

                {pngUrl ? (
                  // Local object URL — a plain <img> is right here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pngUrl}
                    alt=""
                    className="w-full max-w-[240px] rounded-xl"
                  />
                ) : (
                  <div className="aspect-square w-full max-w-[240px] animate-pulse rounded-xl bg-white" />
                )}

                {showName && venue.name ? (
                  <p className="text-[17px] font-bold">{venue.name}</p>
                ) : null}
                {caption.trim() ? (
                  <p className="text-[14px] leading-snug text-muted">{caption}</p>
                ) : null}
                {showUrl ? (
                  <p className="break-all text-[13px] text-muted">{menuUrl}</p>
                ) : null}
              </div>
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
              <Button variant="primary" onClick={downloadTent} className="py-2.5 text-[15px]">
                <Download size={16} />
                {copy.qrDownloadTent}
              </Button>
              <Button
                variant="secondary"
                onClick={downloadCodePng}
                className="py-2.5 text-[15px]"
              >
                <Download size={16} />
                {copy.qrDownloadPng}
              </Button>
            </div>

            <p className="text-[13px] leading-snug text-muted">{copy.qrScanHint}</p>
          </div>

          {/* Style + text controls */}
          <div className="flex flex-col gap-6 rounded-[20px] border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[17px] font-bold tracking-[-0.01em]">
                {copy.qrCustomize}
              </h3>
              <button
                type="button"
                onClick={resetStyle}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-foreground"
              >
                <RotateCcw size={15} />
                {copy.qrReset}
              </button>
            </div>

            {/* Colours */}
            <section className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{copy.qrColorPresets}</p>
              <div className="flex flex-wrap gap-2">
                {QR_COLOR_PRESETS.map((preset) => {
                  const active = preset.dots === dotColor && preset.bg === bgColor;
                  const label = locale === "kz" ? preset.kk : preset.ru;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => {
                        setDotColor(preset.dots);
                        setBgColor(preset.bg);
                      }}
                      title={label}
                      aria-label={label}
                      className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${
                        active ? "border-foreground" : "border-border"
                      }`}
                      style={{ background: preset.dots }}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-4">
                <ColorField label={copy.qrColorDots} value={dotColor} onChange={setDotColor} />
                <ColorField label={copy.qrColorBg} value={bgColor} onChange={setBgColor} />
              </div>
            </section>

            {/* Dot shape */}
            <section className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{copy.qrStyleDots}</p>
              <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 sm:grid-cols-5">
                {QR_DOT_STYLES.map((style) => (
                  <StyleTile
                    key={style.key}
                    label={optionLabel(QR_DOT_STYLES, style.key, locale)}
                    active={dotStyle === style.key}
                    onClick={() => setDotStyle(style.key)}
                  >
                    <DotPreview style={style.key} />
                  </StyleTile>
                ))}
              </div>
            </section>

            {/* Corner shape */}
            <section className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{copy.qrStyleCorners}</p>
              <div className="grid grid-cols-3 gap-2">
                {QR_CORNER_STYLES.map((style) => (
                  <StyleTile
                    key={style.key}
                    label={optionLabel(QR_CORNER_STYLES, style.key, locale)}
                    active={cornerStyle === style.key}
                    onClick={() => setCornerStyle(style.key)}
                  >
                    <CornerPreview style={style.key} />
                  </StyleTile>
                ))}
              </div>
            </section>

            {/* Logo */}
            <section className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{copy.qrLogo}</p>
              <div className="flex flex-wrap items-center gap-2">
                <LogoButton active={logoKind === "none"} onClick={clearLogo}>
                  {copy.qrLogoNone}
                </LogoButton>
                {venue.logo_url ? (
                  <LogoButton active={logoKind === "venue"} onClick={useVenueLogo}>
                    {copy.qrLogoVenue}
                  </LogoButton>
                ) : null}
                <LogoButton
                  active={logoKind === "custom"}
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlus size={15} />
                  {copy.qrLogoUpload}
                </LogoButton>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onUpload}
                  className="hidden"
                />
              </div>

              {logo ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-2">
                    {/* Local data URL — a plain <img> is right here. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} alt="" className="h-full w-full object-contain" />
                  </span>
                  <button
                    type="button"
                    onClick={clearLogo}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-red-600"
                  >
                    <Trash2 size={15} />
                    {copy.qrLogoRemove}
                  </button>
                </div>
              ) : (
                <p className="text-[13px] leading-snug text-muted">{copy.qrLogoHint}</p>
              )}

              {logoError ? (
                <p className="text-[13px] leading-snug text-red-600">{copy.qrLogoError}</p>
              ) : null}
            </section>

            {/* Table-tent text */}
            <section className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{copy.qrTextLabel}</p>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">
                {copy.qrTextHeading}
                <input
                  type="text"
                  value={heading}
                  onChange={(event) => setHeading(event.target.value)}
                  className="rounded-xl border border-border px-3 py-2 text-[15px] font-medium text-foreground outline-none focus:border-border-strong"
                />
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">
                {copy.qrTextCaption}
                <input
                  type="text"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  className="rounded-xl border border-border px-3 py-2 text-[15px] font-medium text-foreground outline-none focus:border-border-strong"
                />
              </label>
              <CheckRow checked={showName} onChange={setShowName} label={copy.qrShowName} />
              <CheckRow checked={showUrl} onChange={setShowUrl} label={copy.qrShowUrl} />
            </section>
          </div>
        </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-9 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
      />
      {label}
    </label>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px] font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-accent"
      />
      {label}
    </label>
  );
}

function StyleTile({
  label,
  active,
  onClick,
  children,
}: {
  // The name is a hover/`aria` hint only — the schematic already shows the
  // shape, so the tiles read cleaner without a text caption under each.
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex items-center justify-center rounded-xl border px-2 py-3 transition-colors ${
        active
          ? "border-foreground bg-surface-2 text-foreground"
          : "border-border text-muted hover:border-border-strong hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function LogoButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-foreground bg-surface-2 text-foreground"
          : "border-border text-muted hover:border-border-strong hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// Colour-neutral schematics so the owner recognises the shape before applying
// it. `currentColor` inherits the tile's foreground.
function DotPreview({ style }: { style: QrDotStyle }) {
  const radius: Record<QrDotStyle, number> = {
    square: 0,
    rounded: 2,
    "extra-rounded": 3,
    classy: 1.5,
    dots: 4,
  };
  const cells = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  return (
    <svg width="26" height="26" viewBox="0 0 20 20" aria-hidden="true">
      {cells.map(([x, y]) =>
        style === "dots" ? (
          <circle key={`${x}-${y}`} cx={x * 9 + 4.5} cy={y * 9 + 4.5} r="3.5" fill="currentColor" />
        ) : (
          <rect
            key={`${x}-${y}`}
            x={x * 9 + 1}
            y={y * 9 + 1}
            width="7"
            height="7"
            rx={radius[style]}
            fill="currentColor"
          />
        ),
      )}
    </svg>
  );
}

function CornerPreview({ style }: { style: QrCornerStyle }) {
  if (style === "dot") {
    return (
      <svg width="26" height="26" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 20 20" aria-hidden="true">
      <rect
        x="2"
        y="2"
        width="16"
        height="16"
        rx={style === "extra-rounded" ? 5 : 0}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}
