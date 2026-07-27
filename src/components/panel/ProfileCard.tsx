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
  type ValidationErrors,
} from "@/lib/api";
import { USER_QUERY_KEY } from "@/lib/useAuth";

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
            value={values.current_password}
            errors={errors.current_password}
            onChange={(e) => update("current_password", e.target.value)}
          />

          <Field
            label={copy.newPasswordLabel}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            hint={copy.passwordHint}
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
