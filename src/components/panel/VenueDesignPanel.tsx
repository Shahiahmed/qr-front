"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ImageIcon,
  Loader2,
  Palette,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/landing/ui/Button";
import type { Locale } from "@/content/landing";
import { menuByLocale, type MenuCopy } from "@/content/menu";
import { MENU_THEMES } from "@/content/themes";
import {
  deleteVenueImage,
  updateEstablishment,
  uploadVenueImage,
  type Establishment,
  type VenueImageKind,
} from "@/lib/api";
import { VENUES_QUERY_KEY } from "@/lib/venues";

/**
 * The "Оформление" section of the menu constructor: colour theme plus the venue
 * header a guest sees above the menu (address, phone, Wi-Fi, socials).
 *
 * Saving a venue clears the public-menu cache on the backend (model event), so
 * a guest sees the change on the next scan; here we just refresh the panel's
 * own venue list.
 */
export function VenueDesignPanel({
  locale,
  venue,
}: {
  locale: Locale;
  venue: Establishment;
}) {
  const copy = menuByLocale[locale];
  const queryClient = useQueryClient();
  const themeLang = locale === "kz" ? "kk" : "ru";

  const [open, setOpen] = useState(true);

  // Initialised once from the venue; the form owns its state while editing.
  const [theme, setTheme] = useState(venue.theme || "classic");
  const [fields, setFields] = useState({
    address: venue.address ?? "",
    phone: venue.phone ?? "",
    wifi_ssid: venue.wifi_ssid ?? "",
    wifi_password: venue.wifi_password ?? "",
    instagram_url: venue.instagram_url ?? "",
    facebook_url: venue.facebook_url ?? "",
    tiktok_url: venue.tiktok_url ?? "",
  });

  const set = (key: keyof typeof fields) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: () =>
      updateEstablishment(venue.id, { theme, ...fields }, locale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
    },
  });

  return (
    <section className="mb-6 overflow-hidden rounded-[20px] border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-hover">
          <Palette size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-extrabold tracking-[-0.02em]">
            {copy.design}
          </span>
          <span className="block truncate text-[13px] text-muted-soft">
            {copy.designSub}
          </span>
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-t border-border px-5 py-5">
          {/* Cover + logo upload */}
          <p className="mb-2.5 text-[14px] font-bold text-muted">{copy.imagesLabel}</p>
          <div className="mb-6 space-y-4">
            <ImageUploader
              venue={venue}
              kind="cover"
              currentUrl={venue.cover_url}
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
              label={copy.logoLabel}
              hint={copy.logoHint}
              shape="square"
              copy={copy}
              locale={locale}
            />
          </div>

          {/* Theme presets */}
          <p className="mb-2.5 text-[14px] font-bold text-muted">{copy.themeLabel}</p>
          <div className="mb-6 flex flex-wrap gap-2">
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

          {/* Header fields */}
          <p className="mb-2.5 text-[14px] font-bold text-muted">
            {copy.headerFieldsLabel}
          </p>
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

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => save.mutate()}
              disabled={save.isPending}
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
        </div>
      ) : null}
    </section>
  );
}

/** 8 MB — matches the server's `max:8192`, caught here to skip a doomed POST. */
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * One image slot (cover or logo): a live preview, a hidden file input, and
 * upload / remove actions. On success it refreshes the venue list so the
 * preview — and the guest menu — pick up the new URL.
 */
function ImageUploader({
  venue,
  kind,
  currentUrl,
  label,
  hint,
  shape,
  copy,
  locale,
}: {
  venue: Establishment;
  kind: VenueImageKind;
  currentUrl: string | null;
  label: string;
  hint: string;
  shape: "wide" | "square";
  copy: MenuCopy;
  locale: Locale;
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

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
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
        className={`relative shrink-0 overflow-hidden border border-border-strong bg-surface ${frame}`}
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt={label} className="h-full w-full object-cover" />
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
