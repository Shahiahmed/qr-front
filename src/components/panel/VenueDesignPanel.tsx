"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Percent,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/landing/ui/Button";
import type { Locale } from "@/content/landing";
import { menuByLocale, type MenuCopy } from "@/content/menu";
import { MENU_LAYOUTS, type LayoutKey } from "@/content/layouts";
import { MENU_THEMES } from "@/content/themes";
import {
  deleteVenueImage,
  linkTelegram,
  unlinkTelegram,
  updateEstablishment,
  uploadVenueImage,
  type Establishment,
  type VenueImageKind,
} from "@/lib/api";
import { DEFAULT_VENUE_COVER_URL } from "@/lib/defaultCover";
import { initialLogoDataUrl } from "@/lib/initialLogo";
import { formatPrice, serviceChargeFor } from "@/lib/money";
import { VENUES_QUERY_KEY } from "@/lib/venues";

export type VenueDesignSection = "look" | "contacts";

/**
 * Venue look / contacts editor. Split into two tabs in MenuEditor so owners
 * are not staring at photos, colours and Wi‑Fi while they only wanted to
 * edit a dish price.
 */
export function VenueDesignPanel({
  locale,
  venue,
  section,
}: {
  locale: Locale;
  venue: Establishment;
  section: VenueDesignSection;
}) {
  const copy = menuByLocale[locale];
  const queryClient = useQueryClient();
  const themeLang = locale === "kz" ? "kk" : "ru";

  const [theme, setTheme] = useState(venue.theme || "classic");
  const [layout, setLayout] = useState<LayoutKey>(
    (venue.layout as LayoutKey) || "classic",
  );
  const [fields, setFields] = useState({
    address: venue.address ?? "",
    phone: venue.phone ?? "",
    wifi_ssid: venue.wifi_ssid ?? "",
    wifi_password: venue.wifi_password ?? "",
    instagram_url: venue.instagram_url ?? "",
    facebook_url: venue.facebook_url ?? "",
    tiktok_url: venue.tiktok_url ?? "",
  });
  // Service charge: switch + percent as typed («12,5»). Off saves null.
  const [serviceOn, setServiceOn] = useState(venue.service_charge_percent !== null);
  const [serviceValue, setServiceValue] = useState(percentInput(venue.service_charge_percent));

  // Keep local form in sync when the venue list refreshes after an image upload.
  useEffect(() => {
    setTheme(venue.theme || "classic");
    setLayout((venue.layout as LayoutKey) || "classic");
    setFields({
      address: venue.address ?? "",
      phone: venue.phone ?? "",
      wifi_ssid: venue.wifi_ssid ?? "",
      wifi_password: venue.wifi_password ?? "",
      instagram_url: venue.instagram_url ?? "",
      facebook_url: venue.facebook_url ?? "",
      tiktok_url: venue.tiktok_url ?? "",
    });
    setServiceOn(venue.service_charge_percent !== null);
    setServiceValue(percentInput(venue.service_charge_percent));
  }, [venue]);

  const servicePercent = parsePercent(serviceValue);
  const serviceValid = !serviceOn || servicePercent !== null;

  const set = (key: keyof typeof fields) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: () =>
      updateEstablishment(
        venue.id,
        {
          theme,
          layout,
          ...fields,
          service_charge_percent: serviceOn ? servicePercent : null,
        },
        locale,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
    },
  });

  // One-tap like the stop-list: the logo stays on disk, guests just stop seeing it.
  const toggleLogo = useMutation({
    mutationFn: (showLogo: boolean) =>
      updateEstablishment(venue.id, { show_logo: showLogo }, locale),
    onMutate: async (showLogo) => {
      await queryClient.cancelQueries({ queryKey: VENUES_QUERY_KEY });
      const previous =
        queryClient.getQueryData<Establishment[]>(VENUES_QUERY_KEY);
      queryClient.setQueryData<Establishment[]>(VENUES_QUERY_KEY, (current) =>
        current?.map((item) =>
          item.id === venue.id ? { ...item, show_logo: showLogo } : item,
        ),
      );
      return { previous };
    },
    onError: (_error, _showLogo, context) => {
      if (context?.previous) {
        queryClient.setQueryData(VENUES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
    },
  });

  const showLogo = venue.show_logo !== false;

  const saveBar = (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Button
        variant="primary"
        onClick={() => save.mutate()}
        disabled={save.isPending || !serviceValid}
        className="py-2.5 text-[15px]"
      >
        {save.isPending ? copy.saving : copy.save}
      </Button>

      {save.isSuccess && !save.isPending ? (
        <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-accent-hover">
          <Check size={16} strokeWidth={2.5} />
          {copy.designSaved}
        </span>
      ) : null}

      {save.isError ? (
        <span className="text-[14px] font-semibold text-red-600">
          {copy.designError}
        </span>
      ) : null}
    </div>
  );

  if (section === "look") {
    return (
      <section className="rounded-[20px] border border-border bg-white p-5">
        <header className="mb-5">
          <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
            {copy.tabLook}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-soft">{copy.lookSub}</p>
        </header>

        <p className="mb-2.5 text-[14px] font-bold text-muted">{copy.imagesLabel}</p>
        <div className="mb-6 space-y-4">
          <ImageUploader
            venue={venue}
            kind="cover"
            currentUrl={venue.cover_url}
            previewFallback={DEFAULT_VENUE_COVER_URL}
            label={copy.coverLabel}
            hint={copy.coverHint}
            shape="wide"
            copy={copy}
            locale={locale}
          />
          <ImageUploader
            venue={venue}
            kind="logo"
            currentUrl={venue.logo_url}
            previewFallback={initialLogoDataUrl(venue.name)}
            label={copy.logoLabel}
            hint={copy.logoHint}
            shape="square"
            copy={copy}
            locale={locale}
            dimmed={!showLogo}
            trailing={
              <button
                type="button"
                onClick={() => toggleLogo.mutate(!showLogo)}
                disabled={toggleLogo.isPending}
                aria-pressed={showLogo}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-bold transition-colors disabled:opacity-40 ${
                  showLogo
                    ? "text-muted hover:bg-surface hover:text-foreground"
                    : "bg-surface text-foreground hover:bg-surface-2"
                }`}
              >
                {showLogo ? (
                  <EyeOff size={14} strokeWidth={2.25} />
                ) : (
                  <Eye size={14} strokeWidth={2.25} />
                )}
                {showLogo ? copy.hideLogo : copy.showLogo}
              </button>
            }
          />
        </div>

        <p className="mb-2.5 text-[14px] font-bold text-muted">{copy.layoutLabel}</p>
        <div className="mb-6 grid grid-cols-3 gap-2.5">
          {MENU_LAYOUTS.map((preset) => {
            const selected = layout === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => setLayout(preset.key)}
                aria-pressed={selected}
                className={`flex flex-col gap-2 rounded-[20px] border p-2.5 text-left transition-colors ${
                  selected
                    ? "border-foreground bg-surface"
                    : "border-border-strong hover:bg-surface"
                }`}
              >
                <LayoutPreview layout={preset.key} />
                <span className="flex items-start gap-1">
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold leading-tight">
                      {themeLang === "kk" ? preset.labelKk : preset.labelRu}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-muted-soft">
                      {themeLang === "kk" ? preset.descKk : preset.descRu}
                    </span>
                  </span>
                  {selected ? (
                    <Check
                      size={15}
                      strokeWidth={3}
                      className="ml-auto shrink-0 text-accent-hover"
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mb-2.5 text-[14px] font-bold text-muted">{copy.themeLabel}</p>
        <div className="flex flex-wrap gap-2">
          {MENU_THEMES.map((preset) => {
            const selected = theme === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => setTheme(preset.key)}
                aria-pressed={selected}
                className={`inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-[13px] font-bold transition-colors ${
                  selected
                    ? "border-foreground bg-surface"
                    : "border-border-strong hover:bg-surface"
                }`}
              >
                <span
                  className="grid h-6 w-6 place-items-center rounded-full text-white"
                  style={{ background: preset.accent }}
                >
                  {selected ? <Check size={14} strokeWidth={3} /> : null}
                </span>
                {themeLang === "kk" ? preset.labelKk : preset.labelRu}
              </button>
            );
          })}
        </div>

        {saveBar}
      </section>
    );
  }

  return (
    <section className="rounded-[20px] border border-border bg-white p-5">
      <header className="mb-5">
        <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
          {copy.tabContacts}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted-soft">{copy.contactsSub}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label={copy.fAddress}
          value={fields.address}
          onChange={set("address")}
          className="sm:col-span-2"
        />
        <Field label={copy.fPhone} value={fields.phone} onChange={set("phone")} inputMode="tel" />
        <Field label={copy.fWifiName} value={fields.wifi_ssid} onChange={set("wifi_ssid")} />
        <Field label={copy.fWifiPass} value={fields.wifi_password} onChange={set("wifi_password")} />
        <Field
          label={copy.fInstagram}
          value={fields.instagram_url}
          onChange={set("instagram_url")}
          placeholder={copy.socialHint}
          inputMode="url"
        />
        <Field
          label={copy.fFacebook}
          value={fields.facebook_url}
          onChange={set("facebook_url")}
          placeholder={copy.socialHint}
          inputMode="url"
        />
        <Field
          label={copy.fTiktok}
          value={fields.tiktok_url}
          onChange={set("tiktok_url")}
          placeholder={copy.socialHint}
          inputMode="url"
        />
      </div>

      <ServiceCharge
        copy={copy}
        currency={venue.currency}
        enabled={serviceOn}
        value={serviceValue}
        percent={servicePercent}
        onToggle={setServiceOn}
        onChange={setServiceValue}
      />

      {saveBar}

      <TelegramConnect venue={venue} copy={copy} />
    </section>
  );
}

/** Same cap as the server's `Establishment::MAX_SERVICE_CHARGE`. */
const MAX_SERVICE_CHARGE = 30;
/** One-tap choices — the usual percents in Kazakhstan's cafés. */
const SERVICE_PRESETS = [5, 10, 12, 15];

/** 12.5 → «12,5» for the input; null → «10», the usual pick when switching on. */
function percentInput(percent: number | null): string {
  return percent === null ? "10" : String(percent).replace(".", ",");
}

/** «12,5» → 12.5; null when it's not a 0.5–30 percent with at most one decimal. */
function parsePercent(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d{1,2}(\.\d)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return value >= 0.5 && value <= MAX_SERVICE_CHARGE ? value : null;
}

/**
 * «Плата за обслуживание»: a switch, the common percents as one-tap chips, a
 * field for any other value, and a worked example so the owner sees exactly
 * what the guest will pay. Saved with the rest of the contacts form.
 */
function ServiceCharge({
  copy,
  currency,
  enabled,
  value,
  percent,
  onToggle,
  onChange,
}: {
  copy: MenuCopy;
  currency: string;
  enabled: boolean;
  value: string;
  percent: number | null;
  onToggle: (on: boolean) => void;
  onChange: (value: string) => void;
}) {
  // A round bill reads at a glance: 10 000 ₸ → 11 000 ₸.
  const sampleBill = 1_000_000;
  const example = copy.svcExample
    .replace("{bill}", formatPrice(sampleBill, currency))
    .replace("{total}", formatPrice(sampleBill + serviceChargeFor(sampleBill, percent), currency));

  return (
    <section className="mt-6 rounded-[20px] border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-accent">
          <Percent size={18} strokeWidth={2.25} />
        </span>
        <h3 className="min-w-0 flex-1 text-[15px] font-extrabold leading-tight tracking-[-0.01em]">
          {copy.svcTitle}
        </h3>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={copy.svcTitle}
          onClick={() => onToggle(!enabled)}
          // before: widens the tap area to ~64×44 without changing the look.
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors before:absolute before:-inset-x-2 before:-inset-y-2 before:content-[''] ${
            enabled ? "bg-accent" : "bg-border-strong"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-[left] ${
              enabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-muted-soft">{copy.svcHint}</p>

      {enabled ? (
        <>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="grid grid-cols-4 gap-2">
              {SERVICE_PRESETS.map((preset) => {
                const selected = percent === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onChange(String(preset))}
                    aria-pressed={selected}
                    className={`h-10 rounded-xl border px-2 text-[14px] font-bold tabular-nums transition-colors sm:min-w-14 sm:px-3 ${
                      selected
                        ? "border-accent bg-accent text-white"
                        : "border-border-strong bg-white hover:border-accent hover:text-accent"
                    }`}
                  >
                    {preset}%
                  </button>
                );
              })}
            </div>
            <label className="relative">
              <span className="sr-only">{copy.svcCustom}</span>
              <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                inputMode="decimal"
                placeholder={copy.svcCustom}
                maxLength={4}
                className={`h-10 w-full rounded-xl border bg-white pl-3 pr-7 text-[14px] font-bold tabular-nums outline-none transition-colors focus:border-accent sm:w-[92px] ${
                  percent === null ? "border-red-400" : "border-border-strong"
                }`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-bold text-muted-soft">
                %
              </span>
            </label>
          </div>

          {percent === null ? (
            <p className="mt-2 text-[12.5px] font-semibold text-red-600">{copy.svcInvalid}</p>
          ) : (
            <p className="mt-2 text-[13px] text-muted">{example}</p>
          )}
        </>
      ) : null}
    </section>
  );
}

/**
 * Bind the venue's Telegram chat so guest "call waiter" pings reach it.
 * Mint a deep link, open it (owner presses Start in Telegram → webhook binds),
 * then refetch the venue for the flipped `telegram_connected` flag.
 */
function TelegramConnect({
  venue,
  copy,
}: {
  venue: Establishment;
  copy: MenuCopy;
}) {
  const queryClient = useQueryClient();
  const connected = venue.telegram_connected;
  // Deep link minted by the API. Shown as a real link the owner taps: phones
  // (Safari, WhatsApp/Instagram in-app browsers) silently block window.open
  // after an await, so the old flow spun and then nothing opened.
  const [link, setLink] = useState<string | null>(null);
  const waiting = link !== null && !connected;

  const connect = useMutation({
    mutationFn: () => linkTelegram(venue.id),
    onSuccess: ({ url }) => {
      setLink(url);
      // Saves a tap where popups are allowed (desktop); the link is the fallback.
      const tab = window.open(url, "_blank");
      if (tab) tab.opener = null;
    },
  });

  const disconnect = useMutation({
    mutationFn: () => unlinkTelegram(venue.id),
    onSuccess: () => {
      setLink(null);
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
    },
  });

  // While the owner is in Telegram, poll for the webhook's bind and refresh on
  // return to the tab — no «обновите страницу». Gives up after 10 minutes.
  useEffect(() => {
    if (!waiting) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
    const timer = window.setInterval(refresh, 4000);
    const stop = window.setTimeout(() => window.clearInterval(timer), 10 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [waiting, queryClient]);

  const busy = connect.isPending || disconnect.isPending;

  return (
    <section className="mt-6 rounded-[20px] border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-accent">
          <Send size={18} strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-extrabold tracking-[-0.01em]">
              {copy.tgTitle}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-bold ${
                connected
                  ? "bg-green-100 text-green-700"
                  : "bg-white text-muted"
              }`}
            >
              {connected ? (
                <Check size={13} strokeWidth={3} />
              ) : null}
              {connected ? copy.tgConnected : copy.tgDisconnected}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-snug text-muted-soft">
            {copy.tgHint}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {connected ? (
              <button
                type="button"
                onClick={() => disconnect.mutate()}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-red-600 disabled:opacity-40"
              >
                {disconnect.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} strokeWidth={2.25} />
                )}
                {copy.tgDisconnect}
              </button>
            ) : waiting ? (
              <a
                href={link ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-accent-hover"
              >
                <Send size={15} strokeWidth={2.5} />
                {copy.tgOpen}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => connect.mutate()}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 py-2 text-[13px] font-bold transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
              >
                {connect.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} strokeWidth={2.5} />
                )}
                {connect.isPending ? copy.tgConnecting : copy.tgConnect}
              </button>
            )}
          </div>

          {waiting ? (
            <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-snug text-muted-soft">
              <Loader2 size={13} className="mt-px shrink-0 animate-spin" />
              {copy.tgWaitingHint}
            </p>
          ) : null}

          {connect.isError || disconnect.isError ? (
            <p className="mt-2 text-[12px] font-semibold text-red-600">
              {copy.tgError}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** 8 MB — matches the server's `max:8192`, caught here to skip a doomed POST. */
const MAX_BYTES = 8 * 1024 * 1024;

function ImageUploader({
  venue,
  kind,
  currentUrl,
  previewFallback,
  label,
  hint,
  shape,
  copy,
  locale,
  trailing,
  dimmed = false,
}: {
  venue: Establishment;
  kind: VenueImageKind;
  currentUrl: string | null;
  /** Shown in the thumb when nothing uploaded yet (stock cover for guests). */
  previewFallback?: string;
  label: string;
  hint: string;
  shape: "wide" | "square";
  copy: MenuCopy;
  locale: Locale;
  trailing?: ReactNode;
  /** Soften the preview when the asset is hidden from guests. */
  dimmed?: boolean;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });

  const upload = useMutation({
    mutationFn: (file: File) => uploadVenueImage(venue.id, kind, file, locale),
    onSuccess: refresh,
    onError: () => setError(copy.imageError),
  });

  const remove = useMutation({
    mutationFn: () => deleteVenueImage(venue.id, kind, locale),
    onSuccess: refresh,
    onError: () => setError(copy.imageError),
  });

  const busy = upload.isPending || remove.isPending;
  const displayUrl = currentUrl ?? previewFallback ?? null;

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    if (file.size > MAX_BYTES) {
      setError(copy.imageTooBig);
      return;
    }
    upload.mutate(file);
  };

  const isWide = shape === "wide";
  const frame = isWide
    ? "h-[68px] w-[124px] rounded-xl"
    : "h-[68px] w-[68px] rounded-full";

  return (
    <div className="flex items-start gap-3.5">
      <div
        className={`relative shrink-0 overflow-hidden border border-border-strong bg-surface ${frame} ${
          dimmed ? "opacity-40" : ""
        }`}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted-soft">
            <ImageIcon size={20} />
          </span>
        )}
        {busy ? (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 size={18} className="animate-spin text-accent" />
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold">{label}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-muted-soft">{hint}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-white px-2.5 py-1.5 text-[13px] font-bold transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
          >
            <Upload size={14} strokeWidth={2.5} />
            {currentUrl ? copy.changeImage : copy.uploadImage}
          </button>

          {currentUrl ? (
            <button
              type="button"
              onClick={() => remove.mutate()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-red-600 disabled:opacity-40"
            >
              <Trash2 size={14} strokeWidth={2.25} />
              {copy.removeImage}
            </button>
          ) : null}

          {trailing}
        </div>

        {error ? (
          <p className="mt-1.5 text-[12px] font-semibold text-red-600">{error}</p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFile}
        className="hidden"
      />
    </div>
  );
}

/**
 * Tiny schematic of a menu layout — bars stand in for photos and text so the
 * owner recognises the arrangement at a glance. Deliberately colour-neutral:
 * colour is the separate theme picker; this only shows structure.
 */
function LayoutPreview({ layout }: { layout: LayoutKey }) {
  if (layout === "grid") {
    return (
      <div className="grid h-16 grid-cols-2 grid-rows-2 gap-1.5 rounded-lg border border-border bg-white p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex-1 rounded bg-border-strong" />
            <div className="h-1 w-3/4 rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className="flex h-16 flex-col justify-center gap-2 rounded-lg border border-border bg-white px-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 shrink-0 rounded bg-border-strong" />
            <div className="h-1.5 flex-1 rounded bg-border" />
            <div className="h-1.5 w-3 shrink-0 rounded bg-border-strong" />
          </div>
        ))}
      </div>
    );
  }

  // classic
  return (
    <div className="flex h-16 flex-col gap-1.5 rounded-lg border border-border bg-white p-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-1 items-center gap-1.5">
          <div className="h-full w-1/4 shrink-0 rounded bg-border-strong" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 w-3/4 rounded bg-border-strong" />
            <div className="h-1.5 w-1/2 rounded bg-border" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "url" | "numeric";
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border border-border-strong bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-accent"
      />
    </label>
  );
}
