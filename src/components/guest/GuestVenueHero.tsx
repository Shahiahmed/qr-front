"use client";

import { useState, type ReactNode } from "react";
import { Check, KeyRound, MapPin, Phone, Wifi } from "lucide-react";
import type { GuestCopy } from "@/content/guest";
import { DEFAULT_VENUE_COVER_URL } from "@/lib/defaultCover";
import { initialLogoDataUrl } from "@/lib/initialLogo";
import type { PublicMenu } from "@/lib/guestMenuTypes";

/**
 * Venue cover with contact chips overlaid on the photo.
 *
 * Chips sit on a bottom gradient so white pills stay readable. A brand-new
 * venue has no uploads yet — stock cover + letter logo (first letter of the
 * name, same as `/m/demo`) so the header never looks empty. `show_logo: false`
 * hides the badge without deleting the file. Empty contact fields are skipped.
 */
export function GuestVenueCover({
  menu,
  copy,
}: {
  menu: PublicMenu;
  copy: GuestCopy;
}) {
  const cover = menu.cover_url?.trim() || DEFAULT_VENUE_COVER_URL;
  // Default true: older cached payloads and the static demo omit the flag.
  const showLogo = menu.show_logo !== false;
  const logo = showLogo
    ? menu.logo_url?.trim() || initialLogoDataUrl(menu.name)
    : null;
  const chips = <VenueChips menu={menu} copy={copy} />;

  return (
    <div className="relative aspect-[2/1] max-h-[260px] w-full overflow-hidden bg-surface-2 sm:aspect-[21/9] sm:max-h-[300px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover}
        alt={menu.name}
        className="h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/65 via-black/25 to-transparent"
      />

      {logo ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[52px] grid place-items-center px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={menu.name}
            className="h-[72px] w-[72px] rounded-full border-2 border-white/90 bg-white object-cover shadow-[0_6px_20px_-6px_rgba(0,0,0,0.5)] sm:h-[88px] sm:w-[88px]"
          />
        </div>
      ) : null}

      {hasVenueInfo(menu) ? (
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8 sm:px-4 sm:pb-3.5">
          <div className="mx-auto max-w-[680px]">{chips}</div>
        </div>
      ) : null}
    </div>
  );
}

function hasVenueInfo(menu: PublicMenu): boolean {
  return Boolean(
    menu.address?.trim() ||
      menu.phone?.trim() ||
      menu.wifi_ssid?.trim() ||
      menu.wifi_password?.trim() ||
      menu.instagram_url?.trim() ||
      menu.facebook_url?.trim() ||
      menu.tiktok_url?.trim(),
  );
}

function VenueChips({ menu, copy }: { menu: PublicMenu; copy: GuestCopy }) {
  const address = menu.address?.trim() || null;
  const phone = menu.phone?.trim() || null;
  const wifiSsid = menu.wifi_ssid?.trim() || null;
  const wifiPassword = menu.wifi_password?.trim() || null;
  const instagram = menu.instagram_url?.trim() || null;
  const facebook = menu.facebook_url?.trim() || null;
  const tiktok = menu.tiktok_url?.trim() || null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {address ? (
        <span className={chipClass} title={address}>
          <MapPin size={14} strokeWidth={2.25} className="shrink-0 text-accent" aria-hidden />
          <span className="max-w-[12rem] truncate sm:max-w-[18rem]">{address}</span>
        </span>
      ) : null}

      {wifiSsid ? (
        <span className={chipClass} title={copy.wifiNetworkAria}>
          <Wifi size={14} strokeWidth={2.25} className="shrink-0 text-accent" aria-hidden />
          <span className="font-bold">{wifiSsid}</span>
        </span>
      ) : null}

      {wifiPassword ? (
        <CopyChip value={wifiPassword} label={copy.wifiPasswordAria} copiedLabel={copy.wifiCopied}>
          <KeyRound size={14} strokeWidth={2.25} className="shrink-0 text-accent" aria-hidden />
          <span className="font-bold tabular-nums">{wifiPassword}</span>
        </CopyChip>
      ) : null}

      {phone ? (
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          aria-label={`${copy.phoneAria}: ${phone}`}
          title={phone}
          className={iconChipClass}
        >
          <Phone size={15} strokeWidth={2.25} />
        </a>
      ) : null}

      {instagram ? (
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.instagramAria}
          className={iconChipClass}
        >
          <InstagramIcon />
        </a>
      ) : null}

      {facebook ? (
        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.facebookAria}
          className={iconChipClass}
        >
          <FacebookIcon />
        </a>
      ) : null}

      {tiktok ? (
        <a
          href={tiktok}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.tiktokAria}
          className={iconChipClass}
        >
          <TikTokIcon />
        </a>
      ) : null}
    </div>
  );
}

const chipClass =
  "inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/50 bg-white/95 px-2.5 py-1.5 text-[12px] text-foreground shadow-[0_4px_14px_-6px_rgba(0,0,0,0.45)] backdrop-blur-sm";

const iconChipClass =
  "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/50 bg-white/95 text-foreground shadow-[0_4px_14px_-6px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-colors hover:border-accent hover:text-accent hover:no-underline";

function CopyChip({
  value,
  label,
  copiedLabel,
  children,
}: {
  value: string;
  label: string;
  copiedLabel: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Leave the password visible if clipboard is unavailable.
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
      className={`${chipClass} transition-colors hover:border-accent`}
    >
      {copied ? (
        <>
          <Check size={14} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden />
          <span className="font-bold text-accent">{copiedLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3.1l.9-3H13v-2c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 3c.4 2.4 2 4.2 4.5 4.6v2.9c-1.6 0-3.1-.5-4.4-1.3v6.4c0 3.5-2.8 6.4-6.3 6.4S4 19.1 4 15.6s2.8-6.4 6.3-6.4c.3 0 .7 0 1 .1v3.1c-.3-.1-.7-.2-1-.2-1.8 0-3.2 1.5-3.2 3.4s1.4 3.4 3.2 3.4 3.2-1.5 3.2-3.4V3h3Z" />
    </svg>
  );
}
