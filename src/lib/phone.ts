/** `77011234567` → `+7 701 123 45 67`; anything else is shown as stored. */
export function formatPhone(phone: string): string {
  const m = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  return m ? `+7 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : phone;
}

/** Longest masked value, `+7 702 071 64 94`. */
export const PHONE_MASK_LENGTH = 16;

/**
 * Input mask for a Kazakh number: whatever is typed or pasted becomes
 * `+7 XXX XXX XX XX`, built up as digits arrive.
 */
export function maskPhoneInput(raw: string): string {
  let digits: string;
  let trunkPrefix = false;
  const typedPlus = raw.trimStart().startsWith("+");

  if (typedPlus && raw.replace(/\D/g, "") === "") return "+";

  if (raw.trimStart().startsWith("+7")) {
    // Already masked — the 7 is the country code, everything after is local.
    digits = raw.trimStart().slice(2).replace(/\D/g, "");
  } else {
    digits = raw.replace(/\D/g, "");
    // A full number with its country/trunk prefix (`8 702…`, `7 702…`).
    if (digits.length === 11 && /^[78]/.test(digits)) {
      digits = digits.slice(1);
    } else if (digits.startsWith("8")) {
      // Local `8 …` dialing; no Kazakh mobile code starts with 8.
      digits = digits.slice(1);
      trunkPrefix = true;
    }
  }

  digits = digits.slice(0, 10);
  // Keep the bare prefix while it's being typed (`+7`) or erased down to it.
  if (digits === "") return trunkPrefix || typedPlus ? "+7" : "";

  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)];
  return `+7 ${parts.filter(Boolean).join(" ")}`;
}
