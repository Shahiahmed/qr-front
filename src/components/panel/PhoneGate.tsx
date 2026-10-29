"use client";

import { useMutation } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { ApiError, updatePhone } from "@/lib/api";
import { maskPhoneInput, PHONE_MASK_LENGTH } from "@/lib/phone";
import { useSetAuthUser } from "@/lib/useAuth";

/**
 * Blocking «add your WhatsApp» step over the cabinet. Registration by email
 * requires a number, but Google sign-ins and accounts made before the field
 * existed arrive without one — and a manager can't reach an owner they have no
 * number for. There is deliberately no close button or Escape: the only ways
 * out are saving a number or signing out.
 */
export function PhoneGate({
  locale,
  onSignOut,
  signingOut,
}: {
  locale: Locale;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const copy = authByLocale[locale];
  const setAuthUser = useSetAuthUser();

  const [value, setValue] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: () => updatePhone(value, locale),
    // The user now has a phone, so the shell stops rendering this gate.
    onSuccess: (user) => setAuthUser(user),
    onError: (error: unknown) => {
      setErrors(
        error instanceof ApiError
          ? (error.errors.phone ?? [error.message])
          : [copy.networkError],
      );
    },
  });

  // The cabinet underneath must not scroll while the gate covers it.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm sm:items-center print:hidden">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-gate-title"
        aria-describedby="phone-gate-text"
        className="my-auto w-full max-w-[440px] rounded-[24px] bg-white p-6 shadow-[0_40px_80px_-30px_rgba(20,18,16,0.5)] sm:p-8"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
          <MessageCircle size={24} />
        </span>
        <h2
          id="phone-gate-title"
          className="mt-4 text-[22px] font-extrabold leading-tight tracking-[-0.03em]"
        >
          {copy.phoneGateTitle}
        </h2>
        <p id="phone-gate-text" className="mt-2 text-[15px] leading-relaxed text-muted">
          {copy.phoneGateText}
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setErrors([]);
            mutation.mutate();
          }}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          <Field
            label={copy.phoneLabel}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 701 123 45 67"
            maxLength={PHONE_MASK_LENGTH}
            autoFocus
            value={value}
            errors={errors}
            onChange={(e) => {
              setValue(maskPhoneInput(e.target.value));
              setErrors([]);
            }}
          />
          <Button type="submit" variant="primary" disabled={mutation.isPending} className="h-12 w-full py-0">
            {mutation.isPending ? copy.submitting : copy.save}
          </Button>
        </form>

        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="mx-auto mt-4 block rounded-lg px-3 py-1.5 text-[14px] font-semibold text-muted-soft transition-colors hover:text-foreground"
        >
          {copy.logout}
        </button>
      </div>
    </div>
  );
}
