"use client";

import { ArrowLeft, Check, MessageCircle, MessageSquareText, PenLine, Phone, Send, User, X } from "lucide-react";
import { cloneElement, useEffect, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import { Button } from "@/components/landing/ui/Button";
import {
  TELEGRAM_USERNAME,
  WHATSAPP_MESSAGE,
  WHATSAPP_NUMBER,
} from "@/content/landing";
import { ApiError, isApiConfigured, sendContactRequest, type ValidationErrors } from "@/lib/api";
import { maskPhoneInput, PHONE_MASK_LENGTH } from "@/lib/phone";

type View = "menu" | "form" | "done";

/** lucide dropped brand glyphs, so the WhatsApp mark is an inline SVG. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const inputClass =
  "w-full rounded-[14px] border border-transparent bg-surface pl-11 pr-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted-soft hover:border-border-strong focus:border-accent focus:bg-white focus:ring-3 focus:ring-accent/15 aria-invalid:border-red-400";

const iconBtnClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-soft transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent";

/**
 * One field of the lead form: icon inside the input, the label kept for screen
 * readers only (the placeholder carries it visually), API errors underneath.
 */
function LeadInput({
  icon,
  label,
  errors = [],
  top = false,
  children,
}: {
  icon: ReactNode;
  label: string;
  errors?: string[];
  /** Pin the icon to the first line (textarea) instead of centring it. */
  top?: boolean;
  children: ReactElement<{ "aria-invalid"?: boolean; "aria-label"?: string }>;
}) {
  const invalid = errors.length > 0;
  return (
    <div>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-4 text-muted-soft ${top ? "top-3.5" : "top-1/2 -translate-y-1/2"}`}
        >
          {icon}
        </span>
        {cloneElement(children, { "aria-invalid": invalid || undefined, "aria-label": label })}
      </div>
      {invalid ? <p className="mt-1 px-1 text-[12.5px] text-red-600">{errors[0]}</p> : null}
    </div>
  );
}

/**
 * Floating contact button pinned to the bottom-right of the landing. Fans out
 * round icons — WhatsApp, Telegram (no bare number on purpose) and a call-back
 * form that lands in the admin panel and the admin's Telegram. Sits
 * below the sticky header (z-40) so a header dropdown always wins.
 */
export function ContactWidget() {
  const { locale, copy: landing } = useLandingLocale();
  const copy = landing.contact;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const rootRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState({ name: "", phone: "", note: "" });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  // Bot traps, same as sign-up: an off-screen field and time the form was open.
  const [honeypot, setHoneypot] = useState("");
  const openedAt = useRef<number | null>(null);

  // Escape and a click anywhere outside close the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  function toggle() {
    // Every open starts from the icons; a half-typed form keeps its values.
    if (!open) setView("menu");
    setOpen((v) => !v);
  }

  function showForm() {
    openedAt.current = Date.now();
    setView("form");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setErrors({});
    setFormError(null);
    try {
      await sendContactRequest(
        {
          ...values,
          locale,
          contact_me_by_fax_only: honeypot,
          form_time: openedAt.current === null ? 0 : Date.now() - openedAt.current,
        },
        locale,
      );
      setValues({ name: "", phone: "", note: "" });
      setView("done");
    } catch (error) {
      if (error instanceof ApiError && error.isValidation) {
        setErrors(error.errors);
        setFormError(error.errors.form?.[0] ?? null);
      } else {
        setFormError(copy.error);
      }
    } finally {
      setSending(false);
    }
  }

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  // Speed-dial order, top to bottom; the last one sits right above the main button.
  const actions = [
    {
      key: "wa",
      href: waHref,
      label: copy.whatsapp,
      tile: "bg-[#25D366] text-white",
      icon: <WhatsAppIcon className="h-6 w-6" />,
    },
    {
      key: "tg",
      href: `https://t.me/${TELEGRAM_USERNAME}`,
      label: copy.telegram,
      tile: "bg-[#229ED9] text-white",
      icon: <Send size={21} className="-translate-x-px translate-y-px" />,
    },
    ...(isApiConfigured
      ? [
          {
            key: "lead",
            href: null,
            label: copy.lead,
            tile: "border border-border-strong bg-white text-accent-hover",
            icon: <PenLine size={20} />,
          },
        ]
      : []),
  ];

  // The icons fan out while the visitor picks a channel; the form/thank-you
  // card replaces them once «Оставить заявку» is chosen.
  const dialOpen = open && view === "menu";
  const panelOpen = open && view !== "menu";

  // Labels only on hover/focus — but touch screens have no hover, so there
  // they are always shown.
  const labelClass =
    "pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-[10px] bg-ink px-3 py-1.5 text-[13px] font-semibold text-white opacity-0 translate-x-1 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100";
  const iconClass =
    "group relative flex h-12 w-12 items-center justify-center rounded-full shadow-[0_10px_24px_-12px_rgba(23,19,15,0.5)] transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div ref={rootRef}>
      <ul
        aria-label={copy.title}
        aria-hidden={!dialOpen}
        inert={!dialOpen}
        className="fixed right-6 bottom-[88px] z-40 flex flex-col items-end gap-3 sm:right-7 sm:bottom-[92px]"
      >
        {actions.map((a, i) => (
          <li
            key={a.key}
            style={{ transitionDelay: dialOpen ? `${(actions.length - 1 - i) * 40}ms` : "0ms" }}
            className={`transition-all duration-200 ease-out motion-reduce:transition-none ${
              dialOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-90 opacity-0"
            }`}
          >
            {a.href ? (
              <a href={a.href} target="_blank" rel="noopener noreferrer" className={`${iconClass} ${a.tile}`}>
                {a.icon}
                <span className={labelClass}>{a.label}</span>
              </a>
            ) : (
              <button type="button" onClick={showForm} className={`${iconClass} ${a.tile}`}>
                {a.icon}
                <span className={labelClass}>{a.label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>

      <div
        role="dialog"
        aria-label={copy.formTitle}
        aria-hidden={!panelOpen}
        inert={!panelOpen}
        className={`fixed inset-x-4 bottom-[88px] z-40 max-h-[calc(100dvh-112px)] origin-bottom-right overflow-y-auto overscroll-contain rounded-[24px] border border-border bg-white shadow-[0_24px_60px_-24px_rgba(23,19,15,0.45)] transition-all duration-200 ease-out motion-reduce:transition-none sm:inset-x-auto sm:right-6 sm:bottom-[100px] sm:w-[360px] ${
          panelOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        {view !== "done" ? (
          <form onSubmit={onSubmit} noValidate>
            <div className="flex items-start gap-1 border-b border-border px-3 py-3">
              <button
                type="button"
                onClick={() => setView("menu")}
                aria-label={copy.back}
                className={iconBtnClass}
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0 flex-1 px-1 py-1.5">
                <p className="text-[17px] font-extrabold leading-tight tracking-[-0.02em] text-ink">{copy.formTitle}</p>
                <p className="mt-1 text-[13.5px] leading-snug text-muted">{copy.formSubtitle}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={copy.close} className={iconBtnClass}>
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 p-4">
              {formError ? (
                <p role="alert" className="rounded-[12px] bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
                  {formError}
                </p>
              ) : null}

              {/* Honeypot: off-screen rather than display:none, which some bots skip. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Fax
                  <input
                    type="text"
                    name="contact_me_by_fax_only"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </label>
              </div>

              <LeadInput icon={<User size={18} />} label={copy.name} errors={errors.name}>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder={copy.name}
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  className={`${inputClass} h-12`}
                />
              </LeadInput>
              <LeadInput icon={<Phone size={18} />} label={copy.phone} errors={errors.phone}>
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  maxLength={PHONE_MASK_LENGTH}
                  placeholder="+7 ___ ___ __ __"
                  value={values.phone}
                  onChange={(e) => setValues((v) => ({ ...v, phone: maskPhoneInput(e.target.value) }))}
                  className={`${inputClass} h-12`}
                />
              </LeadInput>
              <LeadInput icon={<MessageSquareText size={18} />} label={copy.note} errors={errors.note} top>
                <textarea
                  name="note"
                  rows={2}
                  maxLength={500}
                  placeholder={copy.notePlaceholder}
                  value={values.note}
                  onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
                  className={`${inputClass} resize-none py-3`}
                />
              </LeadInput>

              <Button type="submit" variant="primary" disabled={sending} className="mt-1 h-12 w-full py-0">
                {sending ? copy.sending : copy.submit}
                {sending ? null : <Send size={16} className="transition-transform group-hover/btn:translate-x-0.5" />}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e3f3ea] text-success">
              <Check size={28} strokeWidth={2.5} />
            </span>
            <p className="mt-4 text-[18px] font-extrabold tracking-[-0.02em] text-ink">{copy.successTitle}</p>
            <p className="mt-1.5 max-w-[260px] text-[14px] text-muted">{copy.successBody}</p>
            <Button variant="secondary" onClick={() => setOpen(false)} className="mt-5 w-full">
              {copy.close}
            </Button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? copy.close : copy.open}
        className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[0_12px_28px_-10px_rgba(210,64,26,0.65)] transition-all duration-200 hover:bg-accent-hover motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:right-6 sm:bottom-6"
      >
        <span className={`absolute transition-all duration-200 ${open ? "scale-50 rotate-90 opacity-0" : "scale-100 opacity-100"}`}>
          <MessageCircle size={26} />
        </span>
        <span className={`absolute transition-all duration-200 ${open ? "scale-100 opacity-100" : "scale-50 -rotate-90 opacity-0"}`}>
          <X size={26} />
        </span>
      </button>
    </div>
  );
}
