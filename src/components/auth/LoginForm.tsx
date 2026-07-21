"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { useSetAuthUser } from "@/lib/useAuth";
import { ApiError, login, type ValidationErrors } from "@/lib/api";

export function LoginForm({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const router = useRouter();
  const setAuthUser = useSetAuthUser();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (values: Parameters<typeof login>[0]) => login(values, locale),
    onSuccess: (user) => {
      setAuthUser(user);
      router.push(`/${locale}/dashboard`);
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
    setValues((current) => ({ ...current, [field]: value }));
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
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <Field
        label={copy.emailLabel}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.kz"
        value={values.email}
        /* The API reports a bad password under `email`, so both land here. */
        errors={errors.email}
        onChange={(e) => update("email", e.target.value)}
      />

      <Field
        label={copy.passwordLabel}
        name="password"
        type="password"
        autoComplete="current-password"
        value={values.password}
        errors={errors.password}
        onChange={(e) => update("password", e.target.value)}
      />

      <Button
        type="submit"
        variant="primary"
        disabled={mutation.isPending}
        className="mt-1 w-full py-3.5 text-base"
      >
        {mutation.isPending ? copy.submitting : copy.submitLogin}
      </Button>
    </form>
  );
}
