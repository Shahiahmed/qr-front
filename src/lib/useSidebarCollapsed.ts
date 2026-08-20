"use client";

import { useSyncExternalStore } from "react";

/**
 * Desktop sidebar collapse, persisted in localStorage so it survives the
 * per-page remount of PanelShell (each cabinet page mounts its own shell).
 *
 * Built on useSyncExternalStore — not useState+effect — so the server snapshot
 * is a stable `false` (expanded): SSR HTML and the first hydration render match
 * (no hydration error), while a client-side navigation reads the stored value
 * synchronously on mount, with no expand→collapse flash. A custom event keeps
 * the two desktop instances (there is only ever one at a time) and other tabs
 * in sync.
 */
const KEY = "qmenu.sidebar-collapsed.v1";
const EVENT = "qmenu:sidebar-collapsed";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(KEY, collapsed ? "1" : "0");
  } catch {
    // Private mode / storage disabled — the toggle just won't persist.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // cross-tab
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
