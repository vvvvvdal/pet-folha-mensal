"use client";

import { useSyncExternalStore } from "react";

export type ThemeMode = "dark" | "light";
const themeEvent = "pet-theme-change";

function getSnapshot(): ThemeMode {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(callback: () => void) {
  window.addEventListener(themeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(themeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "dark" as const,
  );
  const toggleTheme = () => {
    const next = getSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("pet_theme", next);
    } catch {
      /* The theme also works when storage is unavailable. */
    }
    window.dispatchEvent(new Event(themeEvent));
  };
  return { theme, toggleTheme };
}
