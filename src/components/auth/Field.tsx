"use client";

import { useId, type InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  /** Messages for this field as returned by the API. */
  errors?: string[];
};

export function Field({ label, hint, errors = [], ...input }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const invalid = errors.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>

      <input
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : hint ? hintId : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-soft focus:border-accent focus:ring-2 focus:ring-accent/25 ${
          invalid ? "border-red-400" : "border-border-strong"
        }`}
        {...input}
      />

      {invalid ? (
        <p id={errorId} className="text-sm text-red-600">
          {errors[0]}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-muted-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
