"use client";

import { useSyncExternalStore } from "react";

export type ThemeMode = "dark" | "light" | "system";
const themeEvent = "pet-theme-change";
function getPreference(): ThemeMode {
  const value = document.documentElement.dataset.themePreference;
  return value === "system" || value === "dark" ? value : "light";
}
function applyTheme(preference: ThemeMode) {
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = preference === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : preference;
}
function subscribe(callback: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => { applyTheme(getPreference()); callback(); };
  const storage = () => {
    try {
      const saved = localStorage.getItem("pet_theme");
      applyTheme(saved === "system" || saved === "dark" ? saved : "light");
    } catch { /* Retain preference when storage is blocked. */ }
    callback();
  };
  query.addEventListener("change", update);
  window.addEventListener(themeEvent, update);
  window.addEventListener("storage", storage);
  return () => {
    query.removeEventListener("change", update);
    window.removeEventListener(themeEvent, update);
    window.removeEventListener("storage", storage);
  };
}
export function useTheme() {
  const preference = useSyncExternalStore(subscribe, getPreference, () => "light" as const);
  const theme = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme === "dark" ? "dark" : "light", () => "light" as const);
  const setTheme = (next: ThemeMode) => {
    applyTheme(next);
    try { localStorage.setItem("pet_theme", next); } catch { /* Still works in memory. */ }
    window.dispatchEvent(new Event(themeEvent));
  };
  return { theme, preference, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") };
}
