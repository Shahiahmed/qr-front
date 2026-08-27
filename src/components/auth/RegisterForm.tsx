"use client";

import { useMutation } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { useSetAuthUser } from "@/lib/useAuth";
import { captureRefFromUrl, clearStoredRef, readStoredRef } from "@/lib/referral";
import { ApiError, register, type RegisterPayload, type ValidationErrors } from "@/lib/api";

export function RegisterForm({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const router = useRouter();
  const setAuthUser = useSetAuthUser();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // A friend who followed an invite link carries a `?ref=` code — grab it (and
  // any code stashed earlier on the landing) so we can attach the referrer.
  const [referralCode, setReferralCode] = useState<string | null>(null);
  useEffect(() => {
    captureRefFromUrl();
    // localStorage is client-only — reading it in a lazy initializer would
    // diverge from the SSR/prerender (this page is static), so we set it here
    // after mount. Intentional; see the guest-prefs pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReferralCode(readStoredRef());
  }, []);

  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload, locale),
    onSuccess: (user) => {
      // The code has done its job — drop it so a later visitor on this device
      // does not inherit someone else's attribution.
      clearStoredRef();
      // Publish the session before navigating, so the header shows the panel
      // link straight away instead of the sign-in buttons.
      setAuthUser(user);
      router.push(`/${locale}/dashboard`);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setErrors(error.errors);
        // A 422 is already explained field by field; anything else is not.
        setFormError(error.isValidation ? null : error.message);
        return;
      }

      setFormError(copy.networkError);
    },
  });

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));

    // Clear the server message for a field as soon as it is edited.
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
    mutation.mutate({ ...values, referral_code: referralCode });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3.5">
      {referralCode ? (
        <p className="flex items-center gap-2.5 rounded-xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent-hover">
          <Gift size={17} className="shrink-0" />
          {copy.refRegisterBanner}
        </p>
      ) : null}

      {formError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <Field
        label={copy.nameLabel}
        name="name"
        autoComplete="name"
        placeholder={copy.namePlaceholder}
        value={values.name}
        errors={errors.name}
        onChange={(e) => update("name", e.target.value)}
      />

      <Field
        label={copy.emailLabel}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.kz"
        value={values.email}
        errors={errors.email}
        onChange={(e) => update("email", e.target.value)}
      />

      {/* Password + confirmation share a row on sm+ (they stack on phones) —
          it keeps the whole form on one screen without shrinking anything. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label={copy.passwordLabel}
          name="password"
          type="password"
          autoComplete="new-password"
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
          placeholder="••••••••"
          showLabel={copy.passwordShow}
          hideLabel={copy.passwordHide}
          value={values.password_confirmation}
          onChange={(e) => update("password_confirmation", e.target.value)}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={mutation.isPending}
        className="mt-1 w-full py-3 text-base"
      >
        {mutation.isPending ? copy.submitting : copy.submitRegister}
      </Button>
    </form>
  );
}
