"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Palette } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/landing/ui/Button";
import type { Locale } from "@/content/landing";
import { menuByLocale } from "@/content/menu";
import { MENU_THEMES } from "@/content/themes";
import { updateEstablishment, type Establishment } from "@/lib/api";
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
