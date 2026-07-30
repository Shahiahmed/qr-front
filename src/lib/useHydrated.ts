"use client";

import { useSyncExternalStore } from "react";

/*
 * Returns `false` on the server and during the very first client render, then
 * `true` after hydration. Markup that depends on client-only state (session
 * storage, auth) can gate on this so the hydration render matches the server
 * HTML — no mismatch.
 *
 * `useSyncExternalStore` is the hydration-safe primitive for exactly this:
 * React renders `getServerSnapshot` (false) during SSR and hydration, then
 * re-renders with `getSnapshot` (true). A later client navigation (an /ru ↔ /kz
 * locale hop) has no hydration pass, so the snapshot is already `true` — the
 * header does not flash back to its pre-hydration branch. This also avoids the
 * `set-state-in-effect` lint that a `useEffect` + `setState` version trips.
 */
const subscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
