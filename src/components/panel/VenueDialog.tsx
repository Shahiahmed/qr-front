"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import {
  ApiError,
  createEstablishment,
  updateEstablishment,
  type Establishment,
  type ValidationErrors,
} from "@/lib/api";
import { PUBLIC_MENU_HOST, VENUES_QUERY_KEY } from "@/lib/venues";
import { slugify } from "@/lib/slug";

const CURRENCIES = [
  { code: "KZT", label: "₸ Тенге (KZT)" },
  { code: "USD", label: "$ Доллар (USD)" },
  { code: "RUB", label: "₽ Рубль (RUB)" },
];

const LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "kk", label: "Қазақша" },
];

export function VenueDialog({
  locale,
  venue,
  onClose,
}: {
  locale: Locale;
  /** Present when editing; absent when creating. */
  venue?: Establishment;
  onClose: () => void;
}) {
  const copy = authByLocale[locale];
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState({
    name: venue?.name ?? "",
    slug: venue?.slug ?? "",
    currency: venue?.currency ?? "KZT",
    default_locale: venue?.default_locale ?? "ru",
    address: venue?.address ?? "",
    phone: venue?.phone ?? "",
  });

  /*
   * The slug follows the name until the owner types one. After that it is
   * theirs — retyping the name must not silently overwrite their choice.
   */
  const [slugTouched, setSlugTouched] = useState(Boolean(venue));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: (payload: typeof values) =>
      venue
        ? updateEstablishment(venue.id, payload, locale)
        : createEstablishment(payload, locale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
      onClose();
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setErrors(error.errors);
        setFormError(error.isValidation ? null : error.message);
        return;
      }
      setFormError(copy.networkError);
    },
  });

  function update(field: keyof typeof values, value: string) {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "name" && !slugTouched) next.slug = slugify(value);
      return next;
    });

    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError(null);
    mutation.mutate(values);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        // Only a click on the backdrop itself closes it, not a drag that
        // started inside the form and ended outside.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={venue ? copy.venueEdit : copy.modalAddTitle}
        className="my-auto w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-[0_40px_80px_-30px_rgba(20,18,16,0.5)] sm:p-8"
      >
        <h2 className="mb-6 text-[24px] font-extrabold tracking-[-0.03em]">
          {venue ? copy.venueEdit : copy.modalAddTitle}
        </h2>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {formError ? (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          <Field
            label={copy.fieldVenueName}
            name="name"
            required
            placeholder={copy.fieldVenueNamePlaceholder}
            value={values.name}
            errors={errors.name}
            onChange={(e) => update("name", e.target.value)}
          />

          <div>
            <Field
              label={copy.fieldSlug}
              name="slug"
              required
              hint={copy.fieldSlugHint}
              value={values.slug}
              errors={errors.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
            />
            {values.slug ? (
              <p className="mt-2 truncate text-sm text-muted-soft">
                {PUBLIC_MENU_HOST}/
                <span className="font-bold text-foreground">{values.slug}</span>
              </p>
            ) : null}
          </div>

          <Select
            label={copy.fieldCurrency}
            value={values.currency}
            errors={errors.currency}
            onChange={(value) => update("currency", value)}
            options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
          />

          <Select
            label={copy.fieldLanguage}
            value={values.default_locale}
            errors={errors.default_locale}
            onChange={(value) => update("default_locale", value)}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
          />

          <Field
            label={copy.fieldAddress}
            name="address"
            value={values.address ?? ""}
            errors={errors.address}
            onChange={(e) => update("address", e.target.value)}
          />

          <div className="mt-2 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full py-3 sm:w-auto sm:px-7"
            >
              {copy.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
              className="w-full py-3 sm:w-auto sm:px-7"
            >
              {mutation.isPending ? copy.submitting : venue ? copy.save : copy.add}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  errors = [],
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  errors?: string[];
  onChange: (value: string) => void;
}) {
  const invalid = errors.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        className={`w-full appearance-none rounded-xl border bg-white bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a837c' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_14px_center] bg-no-repeat px-4 py-3 pr-11 text-base outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 ${
          invalid ? "border-red-400" : "border-border-strong"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {invalid ? <p className="text-sm text-red-600">{errors[0]}</p> : null}
    </div>
  );
}
