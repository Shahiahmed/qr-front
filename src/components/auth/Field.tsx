"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  /** Messages for this field as returned by the API. */
  errors?: string[];
  /** Aria labels for the reveal toggle on password fields (RU/KZ). */
  showLabel?: string;
  hideLabel?: string;
};

export function Field({
  label,
  hint,
  errors = [],
  showLabel = "Показать пароль",
  hideLabel = "Скрыть пароль",
  ...input
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const invalid = errors.length > 0;

  // Password inputs get a show/hide eye. Flipping `type` to "text" reveals the
  // value; the button stays out of the tab order after the input padding.
  const isPassword = input.type === "password";
  const [revealed, setRevealed] = useState(false);
  const type = isPassword && revealed ? "text" : input.type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : hint ? hintId : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-soft focus:border-accent focus:ring-2 focus:ring-accent/25 ${
            isPassword ? "pr-12" : ""
          } ${invalid ? "border-red-400" : "border-border-strong"}`}
          {...input}
          type={type}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? hideLabel : showLabel}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-soft transition-colors hover:text-foreground"
          >
            {revealed ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        ) : null}
      </div>

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
