"use client";

import { useEffect } from "react";
import { captureRefFromUrl } from "@/lib/referral";

/**
 * Persists a `?ref=` code the moment a friend lands on the marketing page, so it
 * survives the walk to the sign-up form even if they browse around first.
 * Renders nothing.
 */
export function RefCapture() {
  useEffect(() => {
    captureRefFromUrl();
  }, []);

  return null;
}
