"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import {
  ApiError,
  changePassword,
  currentUser,
  updatePhone,
  type ValidationErrors,
} from "@/lib/api";
import { formatPhone } from "@/lib/phone";
import { USER_QUERY_KEY, useSetAuthUser } from "@/lib/useAuth";

/**
 * WhatsApp number with inline edit. Google sign-ins and accounts made before
 * the field existed start empty — this is where they add one.
 */
function PhoneRow({ locale, phone }: { locale: Locale; phone: string | null }) {
  const copy = authByLocale[locale];
  const setAuthUser = useSetAuthUser();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: () => updatePhone(value, locale),
    onSuccess: (user) => {
      setAuthUser(user);
      setEditing(false);
      setSaved(true);
    },
    onError: (error: unknown) => {
      setErrors(
        error instanceof ApiError
          ? (error.errors.phone ?? [error.message])
          : [copy.networkError],
      );
    },
  });

  function startEdit() {
    setValue(phone ? formatPhone(phone) : "");
    setErrors([]);
    setSaved(false);
    setEditing(true);
  }

  // <dl> only allows <div>/<dt>/<dd> children, hence the wrapper.
  if (editing) {
    return (
      <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setErrors([]);
          mutation.mutate();
        }}
        noValidate
        className="flex flex-col gap-3"
      >
        <Field
          label={copy.phoneLabel}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 701 123 45 67"
          hint={copy.phoneHint}
          autoFocus
          value={value}
          errors={errors}
          onChange={(e) => {
            setValue(e.target.value);
            setErrors([]);
          }}
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={mutation.isPending} className="px-5 py-2.5">
            {mutation.isPending ? copy.submitting : copy.save}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="px-5 py-2.5">
            {copy.cancel}
          </Button>
        </div>
      </form>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <dt className="text-sm text-muted-soft">{copy.phoneLabel}</dt>
        <dd className={`text-[15px] ${phone ? "" : "text-muted-soft"}`}>
          {phone ? formatPhone(phone) : copy.phoneEmpty}
        </dd>
        {saved ? (
          <p role="status" className="mt-1 text-sm font-semibold text-accent-hover">
            {copy.phoneSaved}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={startEdit}
        className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
      >
        {copy.venueEdit}
      </button>
    </div>
  );
}

export function ProfileCard({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const { data: user } = useQuery({ queryKey: USER_QUERY_KEY, queryFn: currentUser });

  const [values, setValues] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => changePassword(values, locale),
    onSuccess: () => {
      setValues({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setErrors({});
      setFormError(null);
      setSuccess(true);
    },
    onError: (error: unknown) => {
      setSuccess(false);
      if (error instanceof ApiError) {
        setErrors(error.errors);
        setFormError(error.isValidation ? null : error.message);
        return;
      }
      setFormError(copy.networkError);
    },
  });

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setSuccess(false);
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
    setSuccess(false);
    mutation.mutate();
  }

  if (!user) return null;

  return (
    <div className="flex max-w-[520px] flex-col gap-5">
      <div className="rounded-[20px] border border-border bg-white p-6">
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="text-sm text-muted-soft">{copy.nameLabel}</dt>
            <dd className="text-lg font-bold">{user.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-soft">{copy.emailLabel}</dt>
            <dd className="text-[15px]">{user.email}</dd>
          </div>
          <PhoneRow locale={locale} phone={user.phone ?? null} />
        </dl>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-[20px] border border-border bg-white p-6"
      >
        <h2 className="mb-5 text-[18px] font-extrabold tracking-[-0.02em]">
          {copy.passwordChangeTitle}
        </h2>

        <div className="flex flex-col gap-4">
          {formError ? (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          {success ? (
            <p
              role="status"
              className="rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-hover"
            >
              {copy.passwordChangeSuccess}
            </p>
          ) : null}

          <Field
            label={copy.currentPasswordLabel}
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            showLabel={copy.passwordShow}
            hideLabel={copy.passwordHide}
            value={values.current_password}
            errors={errors.current_password}
            onChange={(e) => update("current_password", e.target.value)}
          />

          {/* Split identity check from the new-password pair. */}
          <hr className="border-t border-border" />

          <Field
            label={copy.newPasswordLabel}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            hint={copy.passwordHint}
            placeholder="••••••••"
            showLabel={copy.passwordShow}
            hideLabel={copy.passwordHide}
            value={values.password}
            errors={errors.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <Field
            label={copy.passwordConfirmLabel}
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            showLabel={copy.passwordShow}
            hideLabel={copy.passwordHide}
            value={values.password_confirmation}
            errors={errors.password_confirmation}
            onChange={(e) => update("password_confirmation", e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={mutation.isPending}
            className="mt-1 w-full py-3 sm:w-auto sm:self-start sm:px-7"
          >
            {mutation.isPending ? copy.submitting : copy.passwordChangeSubmit}
          </Button>
        </div>
      </form>
    </div>
  );
}
